"use client";

import { ThemeProvider } from "next-themes";
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/modules/auth/containers/AuthProvider";
import { usePathname } from "next/navigation";

function RootProviders({ children }: { children: ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));
  const pathname = usePathname();

  // Don't wrap root page with AuthProvider to avoid redirect loops
  // But wrap auth pages with AuthProvider for login functionality
  const isRootPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth/");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {isRootPage ? (
          children
        ) : (
          <AuthProvider>
            {children}
          </AuthProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default RootProviders;
