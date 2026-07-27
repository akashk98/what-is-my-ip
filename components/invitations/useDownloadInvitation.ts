"use client";

import { useCallback, useMemo, useState } from "react";
import { toPng } from "html-to-image";

export default function useDownloadInvitation() {
  const [loading, setLoading] = useState(false);

  const downloadInvitation = useCallback(async (rootId: string) => {
    setLoading(true);
    try {
      const root = document.getElementById(rootId);
      if (!root) {
        throw new Error("Could not find invitation element.");
      }
      const dataUrl = await toPng(root, {
        cacheBust: true,
        backgroundColor: "#F6F8FC",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "Invitation.png";
      link.click();
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ loading, downloadInvitation }),
    [loading, downloadInvitation],
  );
}
