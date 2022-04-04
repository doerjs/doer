module.exports = `
import React, { useMemo } from 'react'
<% layouts.forEach(function(layout) { %>
import <%= layout.layoutName %> from './layouts/<%= layout.layoutName %>'
<% }) %>
import { firstCharToUpperCase, getLayoutName } from './helper'

const LayoutComponents = {
  <% layouts.forEach(function(layout) { %>
  <%= layout.layoutName %>: <%= layout.layoutName %>,
  <% }) %>
}

function getLayoutComponent(layoutName = '') {
  const LayoutComponent = LayoutComponents['L' + firstCharToUpperCase(layoutName)]

  return LayoutComponent || null
}

export function useLayoutName() {
  return useMemo(() => {
    const layoutName = getLayoutName()
    const LayoutComponent = getLayoutComponent(layoutName)

    return LayoutComponent ? layoutName : ''
  }, [window.location.hash])
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
