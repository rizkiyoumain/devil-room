import { hashHue } from "@/lib/room/names";
import { cn } from "@/lib/utils";

const WASH = ["veil-wash-0", "veil-wash-1", "veil-wash-2", "veil-wash-3"];

export function VeilAvatar({
  alias,
  guestId,
  src,
  size = "md",
  className,
}: {
  alias: string;
  guestId: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "lg" ? "size-16" : size === "sm" ? "size-8" : "size-10";
  const radius = size === "lg" ? "rounded-xl" : size === "sm" ? "rounded-sm" : "rounded-md";
  const wash = WASH[hashHue(guestId || alias) % WASH.length];
  const initial = (alias.trim()[0] || "V").toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          dim,
          radius,
          "object-cover outline outline-1 -outline-offset-1 outline-foreground/10",
          className,
        )}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={cn(
        dim,
        radius,
        "relative inline-flex items-center justify-center overflow-hidden bg-accent text-sm font-medium text-foreground outline outline-1 -outline-offset-1 outline-foreground/10",
        className,
      )}
      aria-hidden="true"
    >
      <span className={cn("absolute inset-0 opacity-70", wash)} />
      <span className="relative font-display text-sm tracking-wide">{initial}</span>
    </span>
  );
}
