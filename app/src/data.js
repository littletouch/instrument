import axios from 'axios'
import { get, map, includes, filter, sample, isEmpty } from 'lodash-es'
import AV from 'leancloud-storage'

const WIKIDATA_QUERY_ENDPOINT = "https://query.wikidata.org/sparql"
const WIKIDATA_API_ENDPOINT = 'https://www.wikidata.org/w/api.php'
const ALL_ITEMS_QUERY = "SELECT ?id WHERE {?id wdt:P279+ wd:Q34379 .}"


export async function getAllItemIds () {
  const url = WIKIDATA_QUERY_ENDPOINT
  const params = { query: ALL_ITEMS_QUERY, format: 'json' }

  try {
    const response = await axios.get(url, {
      params: params,
    })
    const items = response.data.results.bindings
    return items.map((item) => get(item, 'id.value').split('/').pop())
  } catch (error) {
    console.error(error)
  }
}

export async function getWikiDataItemById (id) {
  const url = WIKIDATA_API_ENDPOINT
  const params = {
    action: 'wbgetentities',
    ids: id,
    origin: '*',
    format: 'json',
    props: 'sitelinks/urls',
  }

  try {
    const response = await axios.get(
      url,
      {
        params,
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    return response.data.entities[id]
  } catch (error) {
    console.error(error)
  }
}


export async function getContentByIdAndLang (id, lang) {
  const wikiName = `${lang}wiki`

  try {
    const data = await getWikiDataItemById(id)
    const sitelinks = data.sitelinks
    let item
    if (isEmpty(sitelinks)) {
      item['id'] = id
      return item
    } else if (includes(sitelinks, wikiName)) {
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
  } catch (error) {
    console.error(error)
  }
}

export async function getUserHistory () {
  try {
    const history = AV.User.current().get('history') || []
    return history
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getNewItemByHistory (history) {
  // history item schema {id, time}
  try {
    const allItemIds = await getAllItemIds()
    const readIds = map(history, (_) => _.id)
    const unreadItems = filter(allItemIds, (itemId) => !includes(readIds, itemId))
    console.log('unread, ', unreadItems.length)
    const itemId = sample(unreadItems)
    return getContentByIdAndLang(itemId, 'en')
  } catch (error) {
    console.error(error)
  }
}
