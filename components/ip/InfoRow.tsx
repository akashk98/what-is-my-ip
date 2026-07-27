import type { ReactNode } from "react";

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-xl text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{label}</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
