import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import FindCopyFiles from "@/components/FindCopyFiles";

export const metadata: Metadata = {
  title: "Find & Copy Files | AK World",
  description: "Find photos and files by exact name and copy selected matches locally in your browser.",
};

export default function FindCopyFilesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <FindCopyFiles />
      </div>
    </main>
  );
}
