import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">
              Something went wrong
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-6 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;