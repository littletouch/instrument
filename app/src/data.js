import axios from 'axios'

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
  return getWikiDataItemById(id).then(function(data){
    return data.sitelinks[`${lang}wiki`]
  })
}
