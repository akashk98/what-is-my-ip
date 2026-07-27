interface CopyButtonProps {
  value: string;
  onCopy: () => Promise<void>;
  loading: boolean;
  success: boolean;
}

export default function CopyButton({ value, onCopy, loading, success }: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Copy public IP address"
    >
      {loading ? "Copying..." : success ? "Copied" : "Copy IP"}
    </button>
  );
}
