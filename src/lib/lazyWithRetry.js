import { lazy } from "react";
import { isLikelyAssetVersionError, tryRecoverFromAssetError } from "@/lib/assetRecovery";

export default function lazyWithRetry(importer) {
  return lazy(() =>
    importer().catch((error) => {
      if (isLikelyAssetVersionError(error) && tryRecoverFromAssetError()) {
        return new Promise(() => {});
      }

      throw error;
    })
  );
}
