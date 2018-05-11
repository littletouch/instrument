# Script to get
# Usage: python get_all_wp_sites.py data.json
from __future__ import print_function

import os
import sys
import json
import requests

_QUERY = """
SELECT ?item ?langcode ?nativeLabel ?enLabel
WHERE
{
      ?item wdt:P31 wd:Q10876391.
      ?item wdt:P424 ?langcode.
      ?item wdt:P407 ?lang.
      ?lang wdt:P1705 ?nativeLabel.
      ?lang rdfs:label ?enLabel filter(lang(?enLabel)='en').
}
"""

_ENDPOINT = "https://query.wikidata.org/sparql"


def get_all_wps():
    r = requests.get(
        _ENDPOINT,
        params={
            'query': _QUERY,
            'format': 'json'
        }
    )
    assert r.status_code == 200
    items = r.json()['results']['bindings']
    res = {}
    for item in items:
        lang_code = item['langcode']['value']
        native = item['nativeLabel']['value']
        en = item['enLabel']['value']
        res[lang_code] = "%s (%s)" % (native, en)
    return res


def main():
    filepath = os.path.abspath(sys.argv[1])
    print("Generate wikipedia languages sites config file at %s" % filepath)
    sites = get_all_wps()
    with open(filepath, 'w') as f:
        json.dump(sites, f, indent=2)
        print("Done!")


if __name__ == '__main__':
    main()
