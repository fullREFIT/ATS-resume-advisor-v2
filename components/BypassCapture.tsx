"use client";

import { useEffect } from "react";

// Reads ?bypass=TOKEN from the URL on first load and stores it in
// localStorage so every subsequent API call includes the bypass header.
export function BypassCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("bypass");
    if (token) {
      try {
        localStorage.setItem("nars_bypass_token", token);
      } catch {
        // Private browsing / quota exceeded — no-op
      }
    }
  }, []);

  return null;
}
