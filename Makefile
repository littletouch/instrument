
start:
	cd app; yarn start;

gen_lang_config:
	python scripts/get_all_wp_sites.py app/src/langs_config.json
