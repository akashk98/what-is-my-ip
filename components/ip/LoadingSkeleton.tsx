export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-20 rounded-[28px] bg-slate-200/70" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-[28px] bg-slate-200/70" />
        <div className="h-44 rounded-[28px] bg-slate-200/70" />
      </div>
    </div>
  );
}
