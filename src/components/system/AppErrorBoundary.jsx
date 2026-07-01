import React from "react";
import { isLikelyAssetVersionError, tryRecoverFromAssetError } from "@/lib/assetRecovery";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: String(error?.message || error || "") };
  }

  componentDidCatch(error) {
    try {
      // Keep this lightweight so it never causes a secondary crash.
      const details = {
        name: error?.name || "Error",
        message: error?.message || String(error || ""),
        stack: error?.stack || "",
      };
      window.__lastAppRenderError = details;
      console.error("App render crash", details);
    } catch {}

    // Stale chunk after a deploy? Try a one-shot reload before showing UI.
    try {
      if (isLikelyAssetVersionError(error) && tryRecoverFromAssetError()) {
        return;
      }
    } catch {}
  }

  handleReload = () => {
    try {
      if (!tryRecoverFromAssetError()) {
        window.location.reload();
      }
    } catch {}
  };

  handleGoHome = () => {
    try {
      window.location.assign("/");
    } catch {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at center, #1b1240 0%, #050510 100%)",
            color: "#e9d5ff",
            padding: "24px",
            textAlign: "center",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <div style={{ maxWidth: 380 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "18px" }}>Something hiccuped</p>
            <p style={{ marginTop: "10px", marginBottom: "16px", opacity: 0.85, fontSize: "14px" }}>
              We hit a temporary loading glitch. Reload this page, or head back to the home feed and keep gaming.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleReload}
                data-testid="app-error-reload-btn"
                style={{
                  border: "1px solid rgba(168,85,247,0.6)",
                  background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                data-testid="app-error-home-btn"
                style={{
                  border: "1px solid rgba(168,85,247,0.4)",
                  background: "rgba(30,10,50,0.6)",
                  color: "#e9d5ff",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
