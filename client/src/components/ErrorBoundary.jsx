import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React render error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{
          minHeight: '100vh',
          padding: '48px',
          fontFamily: 'Arial, sans-serif',
          background: '#111827',
          color: '#fff'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>The site hit a frontend error.</h1>
          <p style={{ marginBottom: '16px' }}>Check the browser console or deployment logs for the details.</p>
          <pre style={{
            whiteSpace: 'pre-wrap',
            background: '#1f2937',
            padding: '16px',
            borderRadius: '8px',
            color: '#fca5a5'
          }}>
            {this.state.error.message}
          </pre>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;