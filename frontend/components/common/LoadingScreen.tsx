import { ClipboardCheck } from "lucide-react";

export function LoadingScreen({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <div className="absolute inset-0 -m-6 rounded-full bg-primary/10 animate-pulse-soft" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
          <ClipboardCheck className="h-8 w-8" />
        </div>
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-4 h-1 w-40 animate-shimmer overflow-hidden rounded-full bg-muted" />
    </div>
  );
}

export function InlineSpinner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      aria-label="loading"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}