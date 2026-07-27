export interface PublicIpInfo {
  ip: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  asnOrg: string;
}

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  device: string;
  platform: string;
  language: string;
  resolution: string;
  colorDepth: string;
  timezone: string;
  cookiesEnabled: string;
  online: string;
}

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: string;
  rtt: string;
  saveData: string;
}

interface CacheEntry {
  publicIp?: PublicIpInfo;
  location?: LocationInfo;
}

let sessionCache: CacheEntry = {};

export function resetIpCache() {
  sessionCache = {};
}

async function fetchIpify(): Promise<PublicIpInfo> {
  const res = await fetch("https://api.ipify.org?format=json");
  if (!res.ok) {
    throw new Error("Unable to fetch public IP from fallback service");
  }

  const data = (await res.json()) as { ip?: string };
  if (!data?.ip) {
    throw new Error("Public IP fallback response missing ip");
  }

  return { ip: data.ip };
}

export async function getPublicIp(): Promise<PublicIpInfo> {
  if (sessionCache.publicIp) {
    return sessionCache.publicIp;
  }

  try {
    const res = await fetch("/api/ip");
    if (res.ok) {
      const data = (await res.json()) as { ip?: string };
      if (data?.ip) {
        sessionCache.publicIp = { ip: data.ip };
        return sessionCache.publicIp;
      }
    }
  } catch {
    // ignore and fall back
  }

  const fallbackIp = await fetchIpify();
  sessionCache.publicIp = fallbackIp;
  return sessionCache.publicIp;
}

export async function getPublicIpv6(): Promise<PublicIpInfo> {
  try {
    const res = await fetch("https://api64.ipify.org?format=json");
    if (!res.ok) {
      throw new Error("Unable to fetch IPv6 address");
    }

    const data = (await res.json()) as { ip?: string };
    if (!data?.ip) {
      throw new Error("IPv6 response missing ip");
    }

    return { ip: data.ip };
  } catch {
    return { ip: "Unavailable" };
  }
}

export async function getLocation(): Promise<LocationInfo> {
  if (sessionCache.location) {
    return sessionCache.location;
  }

  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) {
    throw new Error("Unable to fetch location information");
  }

  const data = await res.json();

  const location: LocationInfo = {
    country: data.country_name || "Unavailable",
    region: data.region || data.region_code || "Unavailable",
    city: data.city || "Unavailable",
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable",
    isp: data.org || data.org_name || "Unavailable",
    org: data.organization || data.org || "Unavailable",
    asn: data.asn || "Unavailable",
    asnOrg: data.asn_org || data.asn_org_name || data.org || "Unavailable",
  };

  sessionCache.location = location;
  return location;
}

export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  const platform = navigator.platform || "Unknown";
  const language = navigator.language || "Unknown";
  const resolution = `${window.screen.width}x${window.screen.height}`;
  const colorDepth = `${window.screen.colorDepth}-bit`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  const cookiesEnabled = navigator.cookieEnabled ? "Yes" : "No";
  const online = navigator.onLine ? "Online" : "Offline";

  const os = getOperatingSystem(ua);
  const browser = getBrowserName(ua);
  const version = getBrowserVersion(ua, browser);
  const device = getDeviceType(ua, platform);

  return {
    name: browser,
    version,
    os,
    device,
    platform,
    language,
    resolution,
    colorDepth,
    timezone,
    cookiesEnabled,
    online,
  };
}

function getBrowserName(userAgent: string) {
  if (/OPR|Opera/.test(userAgent)) return "Opera";
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/MSIE|Trident\//.test(userAgent)) return "Internet Explorer";
  return "Unknown";
}

function getBrowserVersion(userAgent: string, browser: string) {
  const versionPatterns: Record<string, RegExp> = {
    Opera: /(?:OPR|Opera)[\/ ]([\d\.]+)/,
    Edge: /Edg\/([\d\.]+)/,
    Chrome: /Chrome\/([\d\.]+)/,
    Safari: /Version\/([\d\.]+)/,
    Firefox: /Firefox\/([\d\.]+)/,
    "Internet Explorer": /(?:MSIE |rv:)([\d\.]+)/,
  };

  const pattern = versionPatterns[browser];
  if (!pattern) return "Unknown";
  const match = userAgent.match(pattern);
  return match?.[1] || "Unknown";
}

function getOperatingSystem(userAgent: string) {
  if (/Windows NT 10\.0/.test(userAgent)) return "Windows 10";
  if (/Windows NT 6\.3/.test(userAgent)) return "Windows 8.1";
  if (/Windows NT 6\.2/.test(userAgent)) return "Windows 8";
  if (/Windows NT 6\.1/.test(userAgent)) return "Windows 7";
  if (/Mac OS X/.test(userAgent)) return "macOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Linux/.test(userAgent)) return "Linux";
  return "Unknown";
}

function getDeviceType(userAgent: string, platform: string) {
  if (/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)) return "Mobile";
  if (/Tablet|iPad/.test(userAgent)) return "Tablet";
  if (/Mac|Win|Linux/.test(platform)) return "Desktop";
  return "Unknown";
}

export function getNetworkInfo(): NetworkInfo {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const type = connection?.type || "Unavailable";
  const effectiveType = connection?.effectiveType || "Unavailable";
  const downlink = connection?.downlink ? `${connection.downlink} Mb/s` : "Unavailable";
  const rtt = connection?.rtt ? `${connection.rtt} ms` : "Unavailable";
  const saveData = typeof connection?.saveData === "boolean" ? (connection.saveData ? "Enabled" : "Disabled") : "Unavailable";

  return {
    type,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
}
