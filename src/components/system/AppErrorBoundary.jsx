import React from "react";
import { tryRecoverFromAssetError } from "@/lib/assetRecovery";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    try {
      // Keep this lightweight so it never causes a secondary crash.
      console.error("App render crash", error);
    } catch {}
  }

  handleReload = () => {
    try {
      if (!tryRecoverFromAssetError()) {
        window.location.reload();
      }
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
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "18px" }}>Loading issue detected</p>
            <p style={{ marginTop: "10px", marginBottom: "16px", opacity: 0.85, fontSize: "14px" }}>
              We hit a startup error on this device. Tap reload to continue.
            </p>
            <button
              onClick={this.handleReload}
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
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
