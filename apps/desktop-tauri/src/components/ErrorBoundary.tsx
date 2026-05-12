import { Component, type ReactNode } from "react";
import i18n from "i18next";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h3>{i18n.t("error.boundary_title")}</h3>
            <p className="error-boundary-message">
              {this.state.error?.message ?? i18n.t("error.boundary_message")}
            </p>
            <button className="settings-btn" onClick={this.handleReset}>
              {i18n.t("error.boundary_retry")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
