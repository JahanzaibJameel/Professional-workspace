import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../button/Button';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to error tracking service in production
    if (import.meta.env.MODE === 'production') {
      // errorTracking.log(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <AlertTriangle size={48} className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorDescription}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <div className={styles.errorDetails}>
              <details className={styles.details}>
                <summary className={styles.summary}>Error details</summary>
                <pre className={styles.errorMessage}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            </div>
            <div className={styles.errorActions}>
              <Button variant="primary" onClick={this.handleReset}>
                Reload application
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'}>
                Go to home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;