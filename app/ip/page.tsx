import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import IPTool from "@/components/IPTool";

export const metadata: Metadata = {
  title: "What Is My IP | AK World",
  description: "Check your public IP address instantly along with browser and network information.",
};

export default function IpPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <IPTool />
      </div>
    </main>
  );
}
