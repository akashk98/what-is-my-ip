import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "AK World | Free Online Tools",
  description: "AK World offers free online tools including What Is My IP, Digital Invitation, and Find & Copy Files.",
};

const tools = [
  {
    href: "/ip",
    icon: "🌐",
    title: "What Is My IP",
    description: "Instantly check your public IP address, browser information, and network details.",
    buttonLabel: "Open Tool",
  },
  {
    href: "/invitations",
    icon: "🎉",
    title: "Digital Invitation",
    description: "Create beautiful online invitations for birthdays, weddings, housewarming ceremonies, anniversaries, and more.",
    buttonLabel: "Create Invitation",
  },
  {
    href: "/find-copy-files",
    icon: "📁",
    title: "Find & Copy Files",
    description: "Find photos and files by name, review matches, and copy them to a folder on your device.",
    buttonLabel: "Find Files",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[1200px] flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="w-full rounded-[32px] bg-white/90 p-10 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.18)]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.36em] text-emerald-600">Welcome to AK World</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">AK World</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Simple online tools to make everyday tasks easier.
            </p>
          </div>
        </section>

        <section className="mt-12 grid w-full gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </section>
      </div>
    </main>
  );
}
