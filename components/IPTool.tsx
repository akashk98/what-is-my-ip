"use client";

import { useEffect, useMemo, useState } from "react";
import type { BrowserInfo, LocationInfo, NetworkInfo, PublicIpInfo } from "./ip/IpService";
import {
  getBrowserInfo,
  getLocation,
  getNetworkInfo,
  getPublicIp,
  getPublicIpv6,
  resetIpCache,
} from "./ip/IpService";
import ErrorMessage from "./ip/ErrorMessage";
import InfoRow from "./ip/InfoRow";
import LoadingSkeleton from "./ip/LoadingSkeleton";

const buildBrowserDetails = (browserInfo: BrowserInfo | null) =>
  browserInfo
    ? [
        { icon: "🌐", label: "Browser", value: browserInfo.name },
        { icon: "🔢", label: "Version", value: browserInfo.version },
        { icon: "💻", label: "OS", value: browserInfo.os },
        { icon: "📱", label: "Device", value: browserInfo.device },
        { icon: "🖥️", label: "Platform", value: browserInfo.platform },
        { icon: "🌍", label: "Timezone", value: browserInfo.timezone },
        { icon: "🧭", label: "Language", value: browserInfo.language },
        { icon: "🎚️", label: "Resolution", value: browserInfo.resolution },
      ]
    : [];

const buildNetworkDetails = (networkInfo: NetworkInfo | null) =>
  networkInfo
    ? [
        { icon: "📡", label: "Connection", value: networkInfo.type },
        { icon: "⚡", label: "Effective Type", value: networkInfo.effectiveType },
        { icon: "📥", label: "Download", value: networkInfo.downlink },
        { icon: "⏱️", label: "Latency", value: networkInfo.rtt },
        { icon: "💾", label: "Data Saver", value: networkInfo.saveData },
      ]
    : [];

export default function IPTool() {
  const [publicIp, setPublicIp] = useState<PublicIpInfo | null>(null);
  const [publicIpv6, setPublicIpv6] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState({
    loading: false,
    success: false,
    message: "",
    target: null as "public" | "ipv4" | "ipv6" | null,
  });
  const [showDetails, setShowDetails] = useState(false);

  const browserDetails = useMemo(() => buildBrowserDetails(browserInfo), [browserInfo]);
  const networkDetails = useMemo(() => buildNetworkDetails(networkInfo), [networkInfo]);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        resetIpCache();

        const [ipData, ipv6Data, locationData] = await Promise.all([
          getPublicIp(),
          getPublicIpv6(),
          getLocation(),
        ]);

        setPublicIp(ipData);
        setPublicIpv6(ipv6Data.ip);
        setLocation(locationData);
        setBrowserInfo(getBrowserInfo());
        setNetworkInfo(getNetworkInfo());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load IP information.");
      } finally {
        setLoading(false);
      }
    }

    void loadAll();
  }, []);

  const handleRetry = async () => {
    resetIpCache();
    setPublicIp(null);
    setPublicIpv6(null);
    setLocation(null);
    setBrowserInfo(null);
    setNetworkInfo(null);
    setError(null);
    setLoading(true);

    try {
      const [ipData, ipv6Data, locationData] = await Promise.all([
        getPublicIp(),
        getPublicIpv6(),
        getLocation(),
      ]);

      setPublicIp(ipData);
      setPublicIpv6(ipv6Data.ip);
      setLocation(locationData);
      setBrowserInfo(getBrowserInfo());
      setNetworkInfo(getNetworkInfo());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load IP information.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value: string, target: "public" | "ipv4" | "ipv6") => {
    setCopyStatus({ loading: true, success: false, message: "", target });
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus({ loading: false, success: true, message: "Copied", target });
      window.setTimeout(() => setCopyStatus({ loading: false, success: false, message: "", target: null }), 2000);
    } catch {
      setCopyStatus({ loading: false, success: false, message: "Copy failed", target });
      window.setTimeout(() => setCopyStatus({ loading: false, success: false, message: "", target: null }), 2000);
    }
  };

  const handleShare = async () => {
    if (!publicIp) return;
    const shareData = {
      title: "My Public IP",
      text: `Public IP: ${publicIp.ip}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopy(publicIp.ip, "public");
      }
    } catch {
      await handleCopy(publicIp.ip, "public");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-slate-950/95 p-8 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.6)] ring-1 ring-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-300">
              Your Public IP
            </span>
            <h1 className="mt-4 text-6xl font-semibold text-white tracking-tight">{publicIp?.ip ?? "Unavailable"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              A modern, minimal IP & connection inspector.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => publicIp && handleCopy(publicIp.ip, "public")}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              {copyStatus.target === "public" && copyStatus.loading
                ? "Copying..."
                : copyStatus.target === "public" && copyStatus.success
                ? "Copied"
                : "Copy Public IP"}
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Share
            </button>
          </div>
        </div>

        {copyStatus.message ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-600/10 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-sky-600/30">
            <span className={copyStatus.success ? "inline-block h-2 w-2 rounded-full bg-sky-400" : "inline-block h-2 w-2 rounded-full bg-rose-400"} />
            {copyStatus.message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-slate-900/90 p-5 ring-1 ring-slate-700">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Browser</p>
            <p className="mt-3 text-sm font-semibold text-white">{browserInfo?.name ?? "Unavailable"}</p>
          </div>
          <div className="rounded-[24px] bg-slate-900/90 p-5 ring-1 ring-slate-700">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">OS</p>
            <p className="mt-3 text-sm font-semibold text-white">{browserInfo?.os ?? "Unavailable"}</p>
          </div>
          <div className="rounded-[24px] bg-slate-900/90 p-5 ring-1 ring-slate-700">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Device</p>
            <p className="mt-3 text-sm font-semibold text-white">{browserInfo?.device ?? "Unavailable"}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Country</p>
          <p className="mt-3 text-base font-semibold text-white">{location?.country ?? "Unavailable"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">ISP</p>
          <p className="mt-3 text-base font-semibold text-white">{location?.isp ?? "Unavailable"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Timezone</p>
          <p className="mt-3 text-base font-semibold text-white">{location?.timezone ?? "Unavailable"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Last Updated</p>
              <p className="mt-3 text-base font-semibold text-white">Updated just now</p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">IPv4</p>
              <p className="mt-3 text-base font-semibold text-white">{publicIp?.ip ?? "Unavailable"}</p>
            </div>
            <button
              type="button"
              onClick={() => publicIp && handleCopy(publicIp.ip, "ipv4")}
              className="rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
            >
              {copyStatus.target === "ipv4" && copyStatus.loading
                ? "Copying..."
                : copyStatus.target === "ipv4" && copyStatus.success
                ? "Copied"
                : "Copy"}
            </button>
          </div>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">IPv6</p>
              <p className="mt-3 text-base font-semibold text-white">{publicIpv6 ?? "Unavailable"}</p>
            </div>
            <button
              type="button"
              onClick={() => publicIpv6 && handleCopy(publicIpv6, "ipv6")}
              className="rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
            >
              {copyStatus.target === "ipv6" && copyStatus.loading
                ? "Copying..."
                : copyStatus.target === "ipv6" && copyStatus.success
                ? "Copied"
                : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">ASN</p>
          <p className="mt-3 text-base font-semibold text-white">{location?.asn ?? "Unavailable"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Organization</p>
          <p className="mt-3 text-base font-semibold text-white">{location?.org ?? "Unavailable"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Connection</p>
          <p className="mt-3 text-base font-semibold text-white">{networkInfo?.type ?? "Unavailable"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">User Agent</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-white truncate">{showDetails ? browserInfo?.name : browserInfo?.name ?? "Unavailable"}</p>
            <button
              type="button"
              onClick={() => setShowDetails((current) => !current)}
              className="rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Show Details
            </button>
          </div>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Language</p>
          <p className="mt-3 text-base font-semibold text-white">{browserInfo?.language ?? "Unavailable"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-950/95 p-5 ring-1 ring-slate-800 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Resolution</p>
          <p className="mt-3 text-base font-semibold text-white">{browserInfo?.resolution ?? "Unavailable"}</p>
        </div>
      </div>

      {showDetails && (
        <div className="rounded-[32px] bg-slate-900/95 p-6 ring-1 ring-slate-800 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.55)]">
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-300">User agent details</p>
          <pre className="mt-4 overflow-x-auto rounded-3xl bg-slate-950 p-4 text-xs leading-6 text-slate-300">
            {navigator.userAgent}
          </pre>
        </div>
      )}
    </div>
  );
}
