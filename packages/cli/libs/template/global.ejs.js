module.exports = `
<% if (relativeGlobalScriptPath) { %>
export * from '<%= relativeGlobalScriptPath %>'
<% if (exports.default) { %>
export { default } from '<%= relativeGlobalScriptPath %>'
<% } %>
<% } %>

<% if (!exports.remotes) { %>
export function remotes() {
  return {}
}
<% } %>
<% if (!exports.onRouteChange) { %>
export function onRouteChange() {}
<% } %>
<% if (!exports.onRender) { %>
export function onRender(oldRender) {
  oldRender()
}
<% } %>
`
