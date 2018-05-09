import axios from 'axios'
import {
  get, map, includes, filter, sample, find, flatten
} from 'lodash'
import AV from 'leancloud-storage'
import { startOfToday, isAfter } from 'date-fns'

import parse from './parse'

const WIKIDATA_QUERY_ENDPOINT = 'https://query.wikidata.org/sparql'
const WIKIDATA_API_ENDPOINT = 'https://www.wikidata.org/w/api.php'
const ALL_ITEMS_QUERY = `
  SELECT ?wd ?sitelink WHERE {
    ?wd wdt:P279+ wd:Q34379 .
    ?sitelink schema:about ?wd .
  }
`

// TODO: move it elsewhere, it should be reading user preference
const getUserLangs = () => window.navigator.languages

const _wpLangRe = /https?:\/\/(\w+)\.wikipedia\.org\S+/g

export async function getAllItemIds(langs = ['zh']) {
  const url = WIKIDATA_QUERY_ENDPOINT
  const params = { query: ALL_ITEMS_QUERY, format: 'json' }

  try {
    const response = await axios.get(url, {
      params: params
    })
    const items = response.data.results.bindings

    const wdLangPairs = items.map(item => {
      const wdId = get(item, 'wd.value').split('/').pop()
      const siteLink = get(item, 'sitelink.value')
      const r = _wpLangRe.exec(siteLink)
      const lang = r && r[1]
      return {
        wdId,
        lang,
      }
    }).filter(item => item.lang)

    const wdIdsByLang = {}

    wdLangPairs.forEach(({wdId, lang}) => {
      if (!wdIdsByLang[lang]) {
        wdIdsByLang[lang] = []
      }
      wdIdsByLang[lang].push(wdId)
    })

    const wdIds = flatten(langs.map(l => wdIdsByLang[l] || []))
    return wdIds

  } catch (error) {
    console.error('fetching all items error', error)
  }
}

export async function getWikiDataItemById(id) {
  const url = WIKIDATA_API_ENDPOINT
  const params = {
    action: 'wbgetentities',
    ids: id,
    origin: '*',
    format: 'json',
    props: 'sitelinks/urls'
  }

  try {
    const response = await axios.get(url, {
      params,
      headers: {
        Accept: 'application/json'
      }
    })
    return response.data.entities[id]
  } catch (error) {
    console.error(error)
  }
}

function _wikipediaLinkToMobile(url) {
  const parts = url.split('.')
  parts.splice(1, 0, 'm')
  return parts.join('.')
}

export async function getContentByIdAndLangs(id, langs) {

  try {
    const data = await getWikiDataItemById(id)
    const sitelinks = data.sitelinks
    const lang = langs.find(lang => sitelinks[`${lang}wiki`])
    const wikiName = `${lang}wiki`
    const item = sitelinks[wikiName]
    item['id'] = id
    item['url'] = _wikipediaLinkToMobile(item['url'])
    return item
  } catch (error) {
    console.error(error)
  }
}

export async function getUserHistory() {
  try {
    const history = AV.User.current().get('history') || []
    return history
  } catch (error) {
    console.error(error)
    return []
  }
}

export const alreadyFetched = (time) => {
  return isAfter(time, startOfToday())
}

export async function getNewItemByHistory(history) {
  // history item schema {id, time}
  try {
    let shouldGetNewItem = true
    let itemId
    let latestItem
    const sortedHistoryByViewTimeDESC = history.sort(
      (h1, h2) => new Date(h2.time) - new Date(h1.time)
    )
    if (sortedHistoryByViewTimeDESC.length) {
      latestItem = sortedHistoryByViewTimeDESC[0]
      if (
        alreadyFetched(latestItem.time)
      ) {
        shouldGetNewItem = false
      } else {
        shouldGetNewItem = true
      }
    } else {
      shouldGetNewItem = true
    }

    const langs = getUserLangs()

    if (shouldGetNewItem) {
      const allItemIds = await getAllItemIds(langs)
      const readIds = map(history, _ => _.id)
      const unreadItems = filter(
        allItemIds,
        itemId => !includes(readIds, itemId)
      )
      itemId = sample(unreadItems)
    } else {
      itemId = latestItem.id
    }
    return getContentByIdAndLangs(itemId, langs)
  } catch (error) {
    console.error(error)
  }
}

export async function refresh() {
  const history = await getUserHistory()
  const instrument = await getNewItemByHistory(history)

  if (
    !find(
      history,
      instrumentInHistory => instrumentInHistory.id === instrument.id
    )
  ) {
    history.push({
      id: instrument.id,
      time: new Date()
    })
    const currentUser = AV.User.current()
    currentUser.set('history', history)
    try {
      await currentUser.save()
    } catch (error) {
      console.error(error)
    }
  }
  const parsedInstrument = await parse(instrument.title)
  return Object.assign({}, parsedInstrument, instrument)
}
