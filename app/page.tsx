"use client";

import { useEffect, useState } from "react";

function detectBrowser(userAgent: string) {
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Edg")) return "Edge";
  return "Unknown";
}

function detectOs(userAgent: string) {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac OS") || userAgent.includes("Macintosh")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown";
}

function detectDeviceType(userAgent: string) {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "Mobile";
  if (/Android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function isIPv4(ip: string) {
  return /^\d+\.\d+\.\d+\.\d+$/.test(ip);
}

export default function Home() {
  const [ip, setIp] = useState<string | null>(null);
  const [displayIp, setDisplayIp] = useState<string>("Loading...");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [showUserAgent, setShowUserAgent] = useState(false);
  const [uaValue, setUaValue] = useState<string | null>(null);
  const [showCopiedNear, setShowCopiedNear] = useState<string | null>(null);

  const [browser, setBrowser] = useState("Detecting...");
  const [os, setOs] = useState("Detecting...");
  const [device, setDevice] = useState("Detecting...");
  const [country, setCountry] = useState("Loading...");
  const [isp, setIsp] = useState("Loading...");
  const [ipv4, setIpv4] = useState<string | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("Loading...");
  const [language, setLanguage] = useState("Loading...");
  const [resolution, setResolution] = useState("Loading...");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const isDev = process.env.NODE_ENV === "development";

  function formatDate(d: Date) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return d.toString();
    }
  }

  function formatRelativeTime(date: Date | null) {
    if (!date) return "—";
    const diff = Date.now() - date.getTime();
    if (diff < 5000) return "Updated just now";
    if (diff < 60000) return `Updated ${Math.floor(diff / 1000)} second${Math.floor(diff / 1000) === 1 ? "" : "s"} ago`;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
    return `Updated ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
  }

  function getIpLabel(value: string) {
    return isIPv4(value) ? "IPv4" : value.includes(":") ? "IPv6" : "IP";
  }

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setBrowser(detectBrowser(ua));
    setOs(detectOs(ua));
    setDevice(detectDeviceType(ua));
    setUaValue(ua || null);
    setLanguage(navigator.language || "Unknown");
    setResolution(`${window.screen.width}×${window.screen.height}`);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
      // map legacy IANA name to modern equivalent
      setTimezone(tz === "Asia/Calcutta" ? "Asia/Kolkata" : tz);
    } catch {
      setTimezone("Unknown");
    }

    let cancelled = false;

    async function loadIpAndInfo() {
      try {
        const res = await fetch("/api/ip");
        const data = await res.json();
        if (cancelled) return;
        const returnedIp = data.ip as string;
        setIp(returnedIp);

        if ((returnedIp === "::1" || returnedIp === "127.0.0.1" || window.location.hostname === "localhost") && isDev) {
          // Friendly local development message only in development
          setDisplayIp("Local Development");
        } else {
          setDisplayIp(returnedIp);
        }

        if (isIPv4(returnedIp)) setIpv4(returnedIp);
        else setIpv6(returnedIp);

        // Fetch external IP info for country/isp/asn when available
        try {
          const ext = await fetch("https://ipapi.co/json/");
          const extData = await ext.json();
          if (!cancelled) {
            setCountry(extData.country_name || "Unknown");
            setIsp(extData.org || "Unknown");
            // extData may include ASN or org fields
            if (extData.ip && isIPv4(extData.ip)) setIpv4(extData.ip);
            if (extData.ip && !isIPv4(extData.ip)) setIpv6(extData.ip);
            if (extData.org) {
              // extData.org often includes org name; keep as ISP fallback
              setIsp(extData.org);
            }
            // store ASN if available
            if ((extData as any).asn) {
              // will be read later into details via closure
              (window as any).__ext_asn = (extData as any).asn;
            }
            if ((extData as any).org) {
              (window as any).__ext_org = (extData as any).org;
            }
          }
        } catch {
          // ignore external API failures
        }
        // set last updated timestamp
        setLastUpdated(new Date());
      } catch (e) {
        setDisplayIp("Unable to fetch");
      }
    }

    loadIpAndInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(intervalId);
  }, []);

  async function handleCopy() {
    if (!ip && !ipv4 && !ipv6) return;
    const toCopy = ip && ip !== "::1" && ip !== "127.0.0.1" ? ip : ipv4 || ipv6 || "";
    const label = getIpLabel(toCopy);
    try {
      await navigator.clipboard.writeText(toCopy);
      setToast({ show: true, message: `✓ ${label} copied` });
      setTimeout(() => setToast({ show: false, message: "" }), 2000);
    } catch {
      // ignore
    }
  }

  async function handleRefresh() {
    // re-run the same fetch used on mount
    try {
      const res = await fetch("/api/ip");
      const data = await res.json();
      const returnedIp = data.ip as string;
      setIp(returnedIp);
      if ((returnedIp === "::1" || returnedIp === "127.0.0.1" || (typeof window !== "undefined" && window.location.hostname === "localhost")) && isDev) {
        setDisplayIp("Local Development");
      } else {
        setDisplayIp(returnedIp);
      }
      if (isIPv4(returnedIp)) setIpv4(returnedIp);
      else setIpv6(returnedIp);
      try {
        const ext = await fetch("https://ipapi.co/json/");
        const extData = await ext.json();
        setCountry(extData.country_name || "Unknown");
        setIsp(extData.org || "Unknown");
        if (extData.ip && isIPv4(extData.ip)) setIpv4(extData.ip);
        if (extData.ip && !isIPv4(extData.ip)) setIpv6(extData.ip);
        if ((extData as any).asn) (window as any).__ext_asn = (extData as any).asn;
        if ((extData as any).org) (window as any).__ext_org = (extData as any).org;
      } catch {
        // ignore
      }
      setLastUpdated(new Date());
      setToast({ show: true, message: "✓ Refreshed" });
      setTimeout(() => setToast({ show: false, message: "" }), 1400);
    } catch {
      setToast({ show: true, message: "Refresh failed" });
      setTimeout(() => setToast({ show: false, message: "" }), 1400);
    }
  }

  async function handleShare() {
    const shareText = `My public IP: ${ipv4 || ipv6 || ip || "Unknown"}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "What Is My IP", text: shareText, url: window.location.href });
        setToast({ show: true, message: "✓ Shared" });
        setTimeout(() => setToast({ show: false, message: "" }), 1400);
        return;
      } catch {
        // fallthrough to copy fallback
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ show: true, message: "✓ Link copied" });
      setTimeout(() => setToast({ show: false, message: "" }), 1400);
    } catch {
      setToast({ show: true, message: "Share failed" });
      setTimeout(() => setToast({ show: false, message: "" }), 1400);
    }
  }

  async function copyValue(value?: string) {
    if (!value) return;
    if (typeof navigator === "undefined" || !(navigator as any).clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      const label = getIpLabel(value);
      setToast({ show: true, message: `✓ ${label} copied` });
      setShowCopiedNear(value);
      setTimeout(() => setShowCopiedNear(null), 1400);
      setTimeout(() => setToast({ show: false, message: "" }), 1200);
    } catch {
      setToast({ show: true, message: "Copy failed" });
      setTimeout(() => setToast({ show: false, message: "" }), 1400);
    }
  }

  // get ASN/org stored from external API if present (guard for SSR)
  const extAsn = typeof window !== "undefined" ? (window as any).__ext_asn || null : null;
  const extOrg = typeof window !== "undefined" ? (window as any).__ext_org || null : null;

  // Connection type detection (guard for SSR)
  let connectionType = "Unknown";
  if (typeof navigator !== "undefined") {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && device === "Mobile") {
      const effective = connection.effectiveType || connection.type || "unknown";
      connectionType = effective === "4g" ? "Cellular (4G)" : effective === "3g" ? "Cellular (3G)" : effective === "2g" ? "Cellular (2G)" : effective === "slow-2g" ? "Cellular (Very Slow)" : effective;
    } else {
      connectionType = "Unknown";
    }
  }

  const details = [
    { label: "Browser", value: browser },
    { label: "OS", value: os },
    { label: "Device", value: device },
    { label: "Country", value: country },
    { label: "ISP", value: isp || extOrg || "Unknown" },
    { label: "Timezone", value: timezone },
    { label: "Last Updated", value: formatRelativeTime(lastUpdated) },
    { label: "IPv4", value: ipv4 ?? "Not Available" },
    { label: "IPv6", value: ipv6 ?? "Not Available" },
    { label: "ASN", value: extAsn || "Not Available" },
    { label: "Organization", value: extOrg || "Not Available" },
    { label: "Connection", value: connectionType },
    { label: "User Agent", value: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown" },
    { label: "Language", value: language },
    { label: "Resolution", value: resolution },
  ];

  const heroValue = ipv4 || ipv6 || ip || displayIp;
  const isLocal = typeof window !== "undefined" && (ip === "::1" || ip === "127.0.0.1" || window.location.hostname === "localhost") && isDev;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-8 py-8 sm:px-10">
            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-700 px-4 py-1 text-sm text-slate-300">
                <span className="text-lg">🌍</span>
                <span>Your Public IP</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {displayIp === "Loading..." || displayIp === "Unable to fetch" ? (
                <div className="h-28 w-full max-w-2xl animate-pulse rounded-lg bg-slate-800" />
              ) : (
                <>
                  <h1 className="mt-2 text-center text-7xl font-extrabold leading-tight break-words">
                    <span className={`${(ipv6 || "").includes(":") ? "font-mono text-7xl" : ""}`}>{heroValue}</span>
                  </h1>
                  {isLocal && (
                    <p className="mt-2 text-sm text-slate-400">(Local Development)</p>
                  )}
                </>
              )}

              <p className="mt-3 text-slate-400 text-center">
                A modern, minimal IP & connection inspector.
              </p>

                <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  aria-label="Copy public IP to clipboard"
                  className="inline-flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                >
                  <span>{toast.show ? "✓ Copied to clipboard" : "📋 Copy Public IP"}</span>
                </button>

                <button
                  onClick={handleRefresh}
                  aria-label="Refresh IP information"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-4 py-2 font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                >
                  Refresh
                </button>

                <button
                  onClick={handleShare}
                  aria-label="Share IP information"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-4 py-2 font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Toast */}
          {toast.show && (
            <div role="status" aria-live="polite" className="fixed right-6 top-6 z-50 rounded-md bg-slate-800/90 px-4 py-2 text-sm text-white shadow-lg">
              {toast.message}
            </div>
          )}

          <div className="grid gap-4 p-6 sm:grid-cols-2 md:grid-cols-3">
            {details.map((d) => {
              const icons: Record<string, string> = {
                Browser: "🌐",
                OS: "💻",
                Device: "📱",
                Country: "📍",
                ISP: "🏢",
                Timezone: "🕒",
                IPv4: "🔢",
                IPv6: "🔢",
                ASN: "🆔",
                Organization: "🏷️",
                Connection: "🔌",
                "User Agent": "🧾",
                Language: "🗣️",
                Resolution: "🖥️",
              };

              return (
                <div key={d.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span>{icons[d.label] || "ℹ️"}</span>
                    <span>{d.label}</span>
                  </p>

                  {d.label === "Last Updated" ? (
                    <p className="mt-2 font-semibold text-white">{d.value}</p>
                  ) : d.label === "User Agent" ? (
                    <div className="mt-2">
                      {!showUserAgent ? (
                        <button
                          onClick={() => setShowUserAgent(true)}
                          className="rounded-md border border-slate-700 bg-transparent px-3 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                          aria-expanded={showUserAgent}
                          aria-controls="user-agent-content"
                        >
                          ▼ Show Details
                        </button>
                      ) : (
                        <div>
                          <button
                            onClick={() => setShowUserAgent(false)}
                            className="rounded-md border border-slate-700 bg-transparent px-3 py-1 text-sm text-slate-300 mb-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                            aria-expanded={showUserAgent}
                            aria-controls="user-agent-content"
                          >
                            ▲ Hide Details
                          </button>
                          <p id="user-agent-content" className="mt-1 font-mono text-sm text-white break-words">{uaValue}</p>
                        </div>
                      )}
                    </div>
                  ) : d.label === "IPv6" ? (
                    <div className="mt-2 flex items-start gap-2">
                      <p className="font-mono text-sm font-semibold text-white break-words">{d.value}</p>
                      <button
                        onClick={() => copyValue(d.value as string)}
                        aria-label={`Copy IPv6 ${d.value}`}
                        className="ml-auto rounded-md border border-slate-700 bg-transparent px-2 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                      >
                        Copy
                      </button>
                    </div>
                  ) : d.label === "IPv4" ? (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="mt-0 font-semibold text-white break-words">{d.value}</p>
                      {d.value && d.value !== "Not Available" && (
                        <button
                          onClick={() => copyValue(d.value as string)}
                          aria-label={`Copy IPv4 ${d.value}`}
                          className="ml-auto rounded-md border border-slate-700 bg-transparent px-2 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {typeof d.value === "string" && (d.value.includes("Loading") || d.value.includes("Unable")) ? (
                        <div className="mt-2 h-6 w-full max-w-xs animate-pulse rounded bg-slate-800" />
                      ) : (
                        <p className="mt-2 font-semibold text-white break-words">{d.value}</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-800 px-6 py-4 text-center text-sm text-slate-400">
            <div>© 2026 AK World</div>
            <div className="mt-1">Fast • Secure • Free</div>
            <div className="mt-2 text-xs text-slate-500">Location information is approximate and based on your public IP address.</div>
            <div className="mt-1 text-xs font-semibold text-slate-300">This tool processes your IP address only to display your connection information. No IP addresses are stored by AK World.</div>
          </div>
        </div>
      </section>
    </main>
  );
}

