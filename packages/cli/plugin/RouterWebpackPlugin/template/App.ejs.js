module.exports = `
import React, { useState, useEffect, useRef } from 'react'
import { HashRouter } from 'react-router-dom'

import { useHistoryChange } from './history'
import { loadScopeComponent, loadScopeModule } from './loader'
import { isFunction, isString, isUndefined, isObject, isDebug, isEnableEditDebug, getHashPath } from './helper'
import { enter, leave } from './global'

import Layout, { getLayoutName } from './Layout'
import Router from './Router'
import Error from './Error'
import Suspense from './Suspense'
import Debug from './Debug'

export function getAppName(hasLayout) {
  const hash = getHashPath()
  const [layoutName = '', appName = ''] = hash.split('/').filter(item => item)
  const name = hasLayout ? appName : layoutName

  if (isString(window.__doer_remotes__[name]) && window.__doer_remotes__[name]) {
    return name
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

    currState.basename = [layoutName, appName].filter(Boolean).join('/')

    setState(currState)
  }

  useEffect(() => {
    load()
  }, [])

  return [state, load]
}

export default function App({ location }) {
  const [{ basename, status, AppRouter }, load] = useAppRouter()

  useEffect(() => {
    enter()
  }, [])

  useHistoryChange(() => {
    load()
  })

  return (
    <Error>
      <Suspense>
        {(isEnableEditDebug() || isDebug()) && <Debug />}
        <Layout>
          <Error mode="page">
            <Suspense mode="page">
              {status === 'loading' ? AppRouter && <AppRouter /> : (
                <HashRouter basename={basename}>
                  {status === 'succeed' && AppRouter ? <AppRouter /> : <Router />}
                </HashRouter>
              )}
            </Suspense>
          </Error>
        </Layout>
      </Suspense>
    </Error>
  )
}
`
