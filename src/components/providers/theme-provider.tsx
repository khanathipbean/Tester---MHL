"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "gradient"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
