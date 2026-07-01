import { lazy } from "react";
import { isLikelyAssetVersionError, tryRecoverFromAssetError } from "@/lib/assetRecovery";

const HARD_RELOAD_DELAY_MS = 900;
const REJECT_AFTER_RECOVERY_MS = 2200;

export default function lazyWithRetry(importer) {
  return lazy(() =>
    importer().catch((error) => {
      if (isLikelyAssetVersionError(error) && tryRecoverFromAssetError()) {
        return new Promise((_, reject) => {
          if (typeof window === "undefined") {
            reject(error);
            return;
          }

          const hardReloadTimer = window.setTimeout(() => {
            try {
              window.location.reload();
            } catch {}
          }, HARD_RELOAD_DELAY_MS);

          window.setTimeout(() => {
            window.clearTimeout(hardReloadTimer);
            reject(error);
          }, REJECT_AFTER_RECOVERY_MS);
        });
      }

      throw error;
    })
  );
}
