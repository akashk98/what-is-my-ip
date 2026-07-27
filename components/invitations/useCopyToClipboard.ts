"use client";

import { useCallback, useState } from "react";

export default function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  }, []);

  return { copied, copy };
}
