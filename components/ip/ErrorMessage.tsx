interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-slate-900 shadow-sm">
      <p className="text-sm font-semibold text-rose-700">Unable to load IP information</p>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
      >
        Retry
      </button>
    </div>
  );
}
