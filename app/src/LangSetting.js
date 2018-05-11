import React, { Component } from 'react'
import Select from 'react-select'
import includes from 'lodash/includes'

import config from './langs_config.json'

const getLangOptions = (cfg, defaults) => {
  const _getOption = (lang) => {
    if (cfg[lang]) {
      return {
        value: lang,
        label: cfg[lang],
      }
    }
  }
  // default langauge code can be langauge variant like zh-my
  // which do not exist on the wikipedia as a site
  let options = defaults.map(_getOption).filter(_ => !!_)

  Object.keys(cfg).forEach((l) => {
    if (!includes(defaults, l)){
      options.push(_getOption(l))
    }
  })
  return options
}

// TODO: store on the local db
class LangSetting extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const defaults = window.navigator.languages
    const options = getLangOptions(config, defaults)
    return (<div>
      <Select
        options={options}
        defaultInputValue="Choose your prefered langauges"
        isMulti />
      <button>Save</button>
    </div>)
  }
}
export default LangSetting
