module.exports = `
import React, { Suspense } from 'react'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'

import { getLayoutName } from './helper'
import history, { useHistoryChange } from './history'
import { onRouteChange } from './global'

import Layout, { useLayoutName } from './Layout'
import Router from './Router'

<% if (loading.layout) { %>
import LayoutLoading from '<%= loading.layout %>'
<% } %>
<% if (loading.page) { %>
import PageLoading from '<%= loading.page %>'
<% } %>
<% if (relativeGlobalStylePath) { %>
import '<%= relativeGlobalStylePath %>'
<% } %>

export default function App({ location }) {
  const layoutName = useLayoutName()

  // TODO 这里需要做优化，看是否有其他方式解决
  // 当布局切换时，浏览器不会刷新，这个时候Router中记录的basename还是上一次的
  // 导致找不到布局，因此这里才主动调用浏览器刷新
  useHistoryChange((params) => {
    onRouteChange(params)
    const currLayoutName = getLayoutName()
    if (currLayoutName !== layoutName) {
      window.location.reload()
    }
  })

  return (
    <Suspense fallback={<% if (loading.layout) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>}>
      <HistoryRouter basename={layoutName} history={history}>
        <Layout>
          <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
            <Router />
          </Suspense>
        </Layout>
      </HistoryRouter>
    </Suspense>
  )
}
`
