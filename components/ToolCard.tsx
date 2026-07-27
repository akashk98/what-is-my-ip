import Link from "next/link";

interface ToolCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
}

export default function ToolCard({ href, icon, title, description, buttonLabel }: ToolCardProps) {
  return (
    <Link href={href} className="group rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_28px_90px_-55px_rgba(15,23,42,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-2xl shadow-sm text-emerald-700">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-slate-800">
            {buttonLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
