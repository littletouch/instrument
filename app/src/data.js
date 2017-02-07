const WIKIDATA_QUERY_ENDPOINT = "https://query.wikidata.org/sparql"
const ALL_ITEMS_QUERY = "SELECT ?id WHERE {?id wdt:P279+ wd:Q34379 .}"


export function getAllItemIds() {
  let url = new URL(WIKIDATA_QUERY_ENDPOINT),
      params = {query: ALL_ITEMS_QUERY, format: 'json'}

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  return fetch(url).then(function(response) {
    return response.json()
  }).then(function(data){
    let items = data.results.bindings
    let itemIds = items.map( item => item['id']['value'].split('/').pop())
    return itemIds
  })
}

function getWikiDataItemById(id) {
  let url = `http://www.wikidata.org/wiki/Special:EntityData/${id}.json`

  return fetch(url).then(function(response) {
    return response.json()
  }).then(function(data){
    return data.entities[id]
  })
}


export function getContentByIdAndLang(id, lang) {
  return getWikiDataItemById(id).then(function(data){
    return data.sitelinks[`${lang}wiki`]
  })
}
