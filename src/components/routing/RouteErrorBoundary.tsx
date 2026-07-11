import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  resetKey?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    console.error('RouteErrorBoundary caught:', _error);
    // In production, we typically log this to an error reporting service.
    // We swallow it here to prevent breaking the app shell.
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error-boundary" role="alert">
          <h2>Failed to load page content</h2>
          <button className="route-retry-button" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
