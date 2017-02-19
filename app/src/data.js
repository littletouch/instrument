import axios from 'axios'
import {map, includes, filter, sample} from 'lodash'

import firebase from 'firebase'

const WIKIDATA_QUERY_ENDPOINT = "https://query.wikidata.org/sparql"
const WIKIDATA_API_ENDPOINT = 'https://www.wikidata.org/w/api.php'
const ALL_ITEMS_QUERY = "SELECT ?id WHERE {?id wdt:P279+ wd:Q34379 .}"


export function getAllItemIds() {
  let url = WIKIDATA_QUERY_ENDPOINT,
      params = {query: ALL_ITEMS_QUERY, format: 'json'}

  return axios.get(url, {
    params: params,
  }).then(function(response){
    let items = response.data.results.bindings
    let itemIds = items.map( item => item['id']['value'].split('/').pop())
    return itemIds
  })
}

function getWikiDataItemById(id) {
  let url = WIKIDATA_API_ENDPOINT,
      params = {
        action: 'wbgetentities',
        ids: id,
        origin: '*',
        format: 'json',
        props: 'sitelinks/urls',
      }

  return axios.get(
    url,
    {
      params: params,
      headers: {
        "Accept": "application/json"
      }
    }
  ).then(function(response){
    return response.data.entities[id]
  })
}


export function getContentByIdAndLang(id, lang) {
  let wikiName = `${lang}wiki`

  return getWikiDataItemById(id).then(function(data){
    let sitelinks = data.sitelinks
    let item
    if (includes(sitelinks, wikiName)) {
      item = sitelinks[wikiName]
      item['id'] = id
      return item
    } else {
      //  TODO: random get one wiki for now
      //  Could use language of the instrument's origin country
      item = sitelinks[Object.keys(sitelinks)[0]]
      item['id'] = id
      return item
    }
  })
}

export function getUserHistoryRefByUid(uid) {
  let database = firebase.database()
  return database.ref('users_history/' + uid)
}

export function getNewItemByHistory(history) {
  // history item schema {id, time}
  return getAllItemIds().then( allItemIds => {
    let readIds = map(history, (_) => _.id)
    let unreadItems = filter(allItemIds, (itemId) => !includes(readIds, itemId))
    console.log('unread, ', unreadItems.length)
    let itemId = sample(unreadItems)
    return getContentByIdAndLang(itemId, 'en')
  })
}
