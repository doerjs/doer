module.exports = `
import { lazy } from 'react'

export default lazy(() => {
  return import(/* webpackChunkName: "page~<%= pageName %>" */'<%= relativeRawPageFilePath %>')
})
`
