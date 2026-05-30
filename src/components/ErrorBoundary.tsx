import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';

type ErrorBoundaryProps = {
  readonly children: ReactNode;
};

type ErrorBoundaryState = {
  readonly hasError: boolean;
};

/**
 * Last-resort UI guard. Operational consoles should fail closed with a safe message,
 * not a blank white screen or leaked exception stack.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Console render failure', { error: error.message, componentStack: info.componentStack });
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <main className="content">
        <Alert type="error" title="Console view failed safely">
          A rendering error was isolated. No secrets were logged. Reload the console or return to the dashboard.
        </Alert>
        <p className="form-actions">
          <Button type="button" onClick={() => { window.location.hash = '/dashboard'; window.location.reload(); }}>
            Reload dashboard
          </Button>
        </p>
      </main>
    );
  }
}
