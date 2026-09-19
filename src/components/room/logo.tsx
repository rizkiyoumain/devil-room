import { cn } from "@/lib/utils";

export function HornMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("text-primary", className)}
    >
      <circle cx="24" cy="24" r="18" className="stroke-current" strokeWidth="1.5" />
      <path
        d="M16 30c1.2-8 4.8-13 8-16 3.2 3 6.8 8 8 16"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 16c-2.5-4-5.5-6-8-6M30 16c2.5-4 5.5-6 8-6"
        className="stroke-current"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mark = size === "lg" ? "size-12" : size === "sm" ? "size-8" : "size-9";
  const type =
    size === "lg"
      ? "text-4xl tracking-[0.18em]"
      : size === "sm"
        ? "text-lg tracking-[0.16em]"
        : "text-xl tracking-[0.18em]";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HornMark className={mark} />
      <span className={cn("font-display font-medium uppercase text-foreground", type)}>
        Devil Room
      </span>
    </div>
  );
}
