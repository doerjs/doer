module.exports = `
import React, { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'

import { useLayoutName, useGlobalEvent } from './hook'
import { getLayoutName } from './helper'

import Layout from './Layout'
import Router from './Router'

<% if (loading.layout) { %>
import LayoutLoading from '<%= loading.layout %>'
<% } %>
<% if (loading.page) { %>
import PageLoading from '<%= loading.page %>'
<% } %>

export default function App() {
  const layoutName = useLayoutName()

  useGlobalEvent('hashchange', () => {
    const currLayoutName = getLayoutName()
    if (currLayoutName !== layoutName) {
      window.location.reload()
    }
  })

  return (
    <Suspense fallback={<% if (loading.layout) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>}>
      <HashRouter basename={layoutName}>
        <Layout>
          <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
            <Router />
          </Suspense>
        </Layout>
      </HashRouter>
    </Suspense>
  )
}
`
