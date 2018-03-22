
import json

from wiki import get_all_wikidata_ids
from upload import upload_data
from config import ALL_IDS_PATH


def main():
    ids = get_all_wikidata_ids()
    upload_data(ALL_IDS_PATH, json.dumps(ids))


if __name__ == '__main__':
    main()
