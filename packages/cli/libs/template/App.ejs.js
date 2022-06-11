module.exports = `
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'

import history, { useHistoryChange } from './history'
import { loadScopeComponent, loadScopeModule } from './loader'
import { isFunction, isUndefined } from './helper'
import { enter, leave } from './global'

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
  const [layoutName = '', appName = ''] = window.location.hash.replace('#', '').split('/').filter(item => item)
  const name = hasLayout ? appName : layoutName

  if (name.startsWith('@')) {
    return name.substr(1)
  }
}

async function loadAppRouter(appName) {
  if (!appName) {
    return Router
  }

  const AppRouter = await loadScopeComponent(appName, './$$Router')
  return AppRouter
}

async function loadAppLifeCycle(appName) {
  if (!appName) {
    return { enter, leave }
  }

  const lifeCycle = await loadScopeModule(appName, './$$app')
  return lifeCycle
}

async function loadApp(appName) {
  const lifeCycle = await loadAppLifeCycle(appName)
  const AppRouter = await loadAppRouter(appName)

  return { AppRouter, lifeCycle }
}

async function callLifeCycle(appName, name, params) {
  const lifeCycle = await loadAppLifeCycle(appName)
  if (!isFunction(lifeCycle[name])) return
  lifeCycle[name](params)
}

let preAppName
function useAppRouter() {
  const [state, setState] = useState({ basename: '', status: 'loading', AppRouter: null })

  async function load() {
    const layoutName = getLayoutName()
    const appName = getAppName(!!layoutName)

    const currState = {
      status: 'loading',
      basename: '',
      AppRouter: null,
    }
    setState({ ...currState })

    try {
      const AppRouter = await loadAppRouter(appName)
      currState.AppRouter = AppRouter
      currState.status = 'succeed'

      if (preAppName !== appName) {
        await callLifeCycle(preAppName, 'leave')
        await callLifeCycle(appName, 'enter')
      }

      preAppName = appName
    } catch (error) {
      currState.AppRouter = null
      currState.status = 'failed'
      console.error(error)
    }

    currState.basename = [layoutName, appName ? '@' + appName : ''].filter(Boolean).join('/')

    setState(currState)
  }

  useEffect(() => {
    load()
  }, [])

  return [state, load]
}

// TODO 渲染应用加载失败的样式, 页面组件加载失败时候的样式
export default function App({ location }) {
  const [{ basename, status, AppRouter }, load] = useAppRouter()

  useEffect(() => {
    enter()
  }, [])

  useHistoryChange(() => {
    load()
  })

  return (
    <Suspense fallback={<% if (loading.layout) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>}>
      <Layout>
        {status === 'loading' ? <% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %> : (
          <HistoryRouter basename={basename} history={history}>
            <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
              <AppRouter />
            </Suspense>
          </HistoryRouter>
        )}
      </Layout>
    </Suspense>
  )
}
`
