module.exports = `
import React, { lazy } from 'react'

import { isUndefined, isFunction } from './helper'

export function loadModule(scope, module) {
  return async () => {
    await __webpack_init_sharing__('default')
    if (isUndefined(window[scope]) || !isFunction(window[scope].init)) {
      throw new Error(\`Module \${scope}.\${module} not found\`)
    }
    await window[scope].init(__webpack_share_scopes__.default)
    if (!isFunction(window[scope].get)) {
      throw new Error(\`Module \${scope}.\${module} not found\`)
    }
    const Module = await window[scope].get(module)

    if (isUndefined(Module)) {
      throw new Error(\`Module \${scope}.\${module} not found\`)
    }
    return Module()
  }
}

// 加载脚本资源
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.src = url
    script.type = 'text/javascript'
    script.async = true
  
    script.onload = () => {
      resolve()
      document.head.removeChild(script)
    }

    script.onerror = () => {
      reject()
      document.head.removeChild(script)
    }

    document.head.appendChild(script)
  })
}

// 加载应用远程入口地址
const scriptCache = new Set()
async function loadScopeScript(scope) {
  const scopeRemoteUrl = window.__doer_remotes__[scope]
  if (!scopeRemoteUrl) return

  if (scriptCache.has(scopeRemoteUrl)) return

  await loadScript(scopeRemoteUrl)
  scriptCache.add(scopeRemoteUrl)
}

// 加载应用模块
export async function loadScopeModule(scope, module) {
  await loadScopeScript(scope)
  return loadModule(scope, module)
}

// 加载应用组件
export async function loadScopeComponent(scope, module) {
  await loadScopeScript(scope)
  const ComponentLoader = loadModule(scope, module)
  return lazy(ComponentLoader)
}
`
