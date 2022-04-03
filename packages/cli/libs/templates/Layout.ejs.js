module.exports = `
import React from 'react'
<% layouts.forEach(function(layout) { %>
import <%= layout.layoutName %> from './layouts/<%= layout.layoutName %>'
<% }) %>
import { useLayoutName } from './hook'
import { firstCharToUpperCase } from './helper'

function getLayoutComponent(layoutName = '') {
  const LayoutComponents = {
    <% layouts.forEach(function(layout) { %>
    <%= layout.layoutName %>: <%= layout.layoutName %>,
    <% }) %>
  }

  const LayoutComponent = LayoutComponents['L' + firstCharToUpperCase(layoutName)]

  return LayoutComponent || null
}

export default function Layout({ children }) {
  const layoutName = useLayoutName()

  const LayoutComponent = getLayoutComponent(layoutName)

  if (LayoutComponent) {
    return <LayoutComponent>{children}</LayoutComponent>
  }

  return children
}
`
