module.exports = `
import React from 'react'

<% if (error.layout) { %>
import LayoutError from '<%= error.layout %>'
<% } %>
<% if (error.page) { %>
import PageError from '<%= error.page %>'
<% } %>

export default class Error extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { error: false, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
  }

  render() {
    let error = <% if (error.layout) { %><LayoutError error={this.state.error} errorInfo={this.state.errorInfo} /><% } else { %><div>Error</div><% } %>
    if (this.props.mode === 'page') {
      error = <% if (error.page) { %><PageError error={this.state.error} errorInfo={this.state.errorInfo} /><% } else { %><div>Error</div><% } %>
    }

    if (this.state.error) {
      return error
    }

    return this.props.children
  }
}
`
