module.exports = `
import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

import { onRender } from './global'
import { isFunction } from './helper'

function render(Node) {
  ReactDOM.render(
    Node,
    document.getElementById(process.env.APP_ROOT_ID || 'root'),
  )
}

if (isFunction(onRender)) {
  onRender((Container) => {
    if (isFunction(Container)) {
      return render(Container(<App />))
    }

    return render(<App />)
  })
} else {
  render(<App />)
}
`
