import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md bg-accent px-3 text-sm text-foreground shadow-card outline-none transition-[box-shadow] duration-150 placeholder:text-subtle file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
