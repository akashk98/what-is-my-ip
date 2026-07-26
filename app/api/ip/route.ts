import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");

  let ip =
    forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "::1";

  // If we appear to be running from localhost (loopback), try to discover
  // the instance's public IP via a trusted external service so deployed
  // environments that don't forward client IPs still show a public address.
  if (ip === "::1" || ip === "127.0.0.1") {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) ip = data.ip;
      }
    } catch (e) {
      // ignore network failures and keep loopback
    }
  }

  return NextResponse.json({ ip });
}