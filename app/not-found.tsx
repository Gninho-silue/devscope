import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0b1223] px-6 text-center">
      <p className="font-heading text-7xl font-bold text-[#2453D3] select-none">
        404
      </p>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-[#f9fafb]">
          Page not found
        </h1>
        <p className="text-sm text-[#6b7280]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-[#2453D3] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2453D3]/80"
      >
        ← Back to home
      </Link>
    </div>
  );
}
