import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
