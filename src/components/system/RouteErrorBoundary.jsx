import React from "react";
import { Link } from "react-router-dom";
import { isLikelyAssetVersionError, tryRecoverFromAssetError } from "@/lib/assetRecovery";

// Lightweight per-route boundary so a single page crash doesn't escalate to the
// global "we hit a startup error" screen. Stale chunk after a deploy triggers
// an automatic recovery reload; everything else shows a friendly retry card so
// the rest of the app (nav, home, etc.) is still usable.
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    try { console.error("Route render error", error); } catch {}
    try {
      if (isLikelyAssetVersionError(error) && tryRecoverFromAssetError()) return;
    } catch {}
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-12 text-center">
          <div
            className="max-w-md w-full rounded-3xl border border-purple-500/30 bg-gray-950/85 px-6 py-7"
            style={{ boxShadow: "0 0 30px rgba(168,85,247,0.18)" }}
            data-testid="route-error-card"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              Page hiccup
            </p>
            <p className="mt-3 text-base font-bold text-white">
              This section had trouble loading on your device.
            </p>
            <p className="mt-1.5 text-sm text-gray-400">
              Tap retry, or jump back to the home feed — your session stays signed in.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                data-testid="route-error-retry-btn"
                className="rounded-full border border-purple-400/60 bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-500"
              >
                Retry
              </button>
              <Link
                to="/"
                data-testid="route-error-home-btn"
                className="rounded-full border border-purple-700/50 bg-gray-900 px-4 py-2 text-sm font-bold text-purple-200 transition hover:text-white hover:border-purple-400/60"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
