module.exports = `
import React, { Suspense } from 'react'

<% if (loading.layout) { %>
import LayoutLoading from '<%= loading.layout %>'
<% } %>
<% if (loading.page) { %>
import PageLoading from '<%= loading.page %>'
<% } %>

export default function({ mode = 'layout', children }) {
  let fallback = <% if (loading.layout) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>
  if (mode === 'page') {
    fallback = <% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}
`
