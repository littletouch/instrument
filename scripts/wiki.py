
import requests

_SPARQL_QUERY = "SELECT ?id  WHERE {?id wdt:P279+ wd:Q34379 .}"
_WIKIDATA_SPARQL = "https://query.wikidata.org/bigdata/namespace/wdq/sparql"


def get_all_wikidata_ids():
    r = requests.get(
        _WIKIDATA_SPARQL,
        params={
            'query': _SPARQL_QUERY,
            'format': 'json'
        }
    )
    assert r.status_code == 200
    items = r.json()['results']['bindings']
    ids = [item['id']['value'].split('/')[-1] for item in items]
    return ids


def get_wiki_data_content_by_id():
    pass


def get_wiki_wikipedia_content_by_id():
    pass
