module.exports = `
import React, { Suspense, useState, useEffect } from 'react'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'

import history, { useHistoryChange } from './history'
import { onRouteChange } from './global'
import { loadScopeModule } from './loader'

import Layout, { getLayoutName } from './Layout'
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

function getAppName(hasLayout) {
  const [layoutName, appName = ''] = window.location.hash.replace('#', '').split('/').filter(item => item)
  const name = hasLayout ? appName : layoutName

  if (name.startsWith('@')) {
    return name.substr(1)
  }
}

// 加载子应用的路由
function useScopeRouter() {
  const [state, setState] = useState({ basename: '', status: 'loading', ScopeRouter: null })

  async function loadScopeRouter() {
    const layoutName = getLayoutName()
    const appName = getAppName(!!layoutName)

    const currState = {
      status: 'loading',
      basename: '',
      ScopeRouter: null,
    }
    setState({ ...currState })
    if (appName) {
      try {
        const Component = await loadScopeModule(appName, './$$Router')
        currState.ScopeRouter = Component
        currState.status = 'succeed'
      } catch (error) {
        currState.ScopeRouter = null
        currState.status = 'failed'
      }
    } else {
      currState.ScopeRouter = null
      currState.status = 'failed'
    }

    if (currState.status === 'succeed') {
      currState.basename = [layoutName, appName ? '@' + appName : ''].filter(Boolean).join('/')
    } else {
      currState.basename = layoutName
    }

    setState(currState)
  }

  useEffect(() => {
    loadScopeRouter()
  }, [])

  return [state, loadScopeRouter]
}

export default function App({ location }) {
  const [{ basename, status, ScopeRouter }, loadScopeRouter] = useScopeRouter()

  useHistoryChange((params) => {
    onRouteChange(params)
    loadScopeRouter()
  })

  return (
    <Suspense fallback={<% if (loading.layout) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>}>
      <Layout>
        {status === 'loading' ? <% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %> : (
          <HistoryRouter basename={basename} history={history}>
            <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
              {ScopeRouter ? <ScopeRouter /> : <Router />}
            </Suspense>
          </HistoryRouter>
        )}
      </Layout>
    </Suspense>
  )
}
`
