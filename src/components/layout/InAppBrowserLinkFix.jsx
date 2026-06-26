import { useEffect } from "react";

function safeAssign(url) {
  const helper = window.__safeLocationAssign;
  if (typeof helper === "function") {
    helper(url);
    return;
  }
  window.location.assign(url);
}

function isSocialInAppBrowser() {
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|TikTok|Snapchat/i.test(ua);
}

export default function InAppBrowserLinkFix() {
  useEffect(() => {
    if (!isSocialInAppBrowser()) return;

    const handleClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.origin);
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (isModifiedClick) return;

      event.preventDefault();
      safeAssign(url.href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
