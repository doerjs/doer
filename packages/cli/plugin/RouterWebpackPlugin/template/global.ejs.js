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
<% if (!exports.render) { %>
export function render(oldRender) {
  oldRender()
}
<% } %>
<% if (!exports.enter) { %>
export function enter() {}
<% } %>
<% if (!exports.leave) { %>
export function leave() {}
<% } %>
`
