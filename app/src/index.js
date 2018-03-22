import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import initStorageProvider from './storageProvider'
import './index.css'

initStorageProvider()

ReactDOM.render(<App />, document.getElementById('root'))
