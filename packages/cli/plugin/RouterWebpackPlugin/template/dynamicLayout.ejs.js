module.exports = `
import { lazy } from 'react'

export default lazy(() => {
  return import(/* webpackChunkName: "layout~<%= layoutName %>" */'<%= relativeRawLayoutFilePath %>')
})
`
