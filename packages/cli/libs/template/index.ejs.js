module.exports = `
import { remotes } from './global'

(async () => {
  const urls = await remotes()
  window.__doer_remotes__ = urls

  import(/* webpackChunkName: "bootstrap" */'./bootstrap')
})()
`
