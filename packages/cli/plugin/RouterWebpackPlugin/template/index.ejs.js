module.exports = `
import { remotes } from './global'
import { isDebug } from './helper'

(async () => {
  window.doer = {}

  let urls = await remotes()

  if (isDebug()) {
    try {
      const localUrls = window.sessionStorage.getItem('<%= appName %>__doer_remotes__')
      urls = localUrls ? Object.assign(urls, JSON.parse(localUrls)) : urls
    } catch (e) {}
  }

  window.__doer_remotes__ = urls

  import(/* webpackChunkName: "bootstrap" */'./bootstrap')
})()
`
