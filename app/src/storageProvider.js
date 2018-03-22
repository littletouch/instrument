import AV from 'leancloud-storage'

const APP_ID = process.env.REACT_APP_AV_APP_ID
const APP_KEY = process.env.REACT_APP_AV_APP_KEY

export default function init() {
  AV.init({
    appId: APP_ID,
    appKey: APP_KEY
  })
}
