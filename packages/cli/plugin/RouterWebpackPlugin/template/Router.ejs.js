module.exports = `
import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
<% pages.forEach(function(page) { %>
import <%= page.pageName %> from './pages/<%= page.pageName %>'
<% }) %>
<% if (notFoundPage) { %>
import NotFound from './pages/<%= notFoundPage.pageName %>'
<% } else { %>
import NotFound from './pages/NotFound'
<% } %>

export default function Router() {
  return (
    <Routes>
      <% pages.forEach(function(page) { %>
      <Route path="<%= page.routePath %>" element={<<%= page.pageName %> />} />
      <% }) %>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
`
