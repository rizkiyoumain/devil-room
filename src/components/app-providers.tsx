import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            className:
              "bg-card text-card-foreground shadow-card border-0 font-sans",
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
