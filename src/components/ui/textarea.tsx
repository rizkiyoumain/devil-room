import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-11 w-full resize-none rounded-md bg-accent px-3 py-2.5 text-sm text-foreground shadow-card outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
