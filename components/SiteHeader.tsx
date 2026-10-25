import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/ip", label: "What Is My IP" },
  { href: "/find-copy-files", label: "Find & Copy Files" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950">
            AK World
          </div>
          <div className="text-base font-semibold">Online Tools</div>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
