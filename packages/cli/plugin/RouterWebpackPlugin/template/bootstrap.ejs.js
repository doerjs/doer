module.exports = `
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import { render as customRender } from './global'
import { isFunction } from './helper'

function render(Node) {
  const root = ReactDOM.createRoot(document.getElementById(process.env.ROOT_ELEMENT_ID || 'root'));
  root.render(Node);
}

if (isFunction(customRender)) {
  customRender((Container) => {
    if (isFunction(Container)) {
      return render(Container(<App />))
    }

    return render(<App />)
  })
} else {
  render(<App />)
}
`
