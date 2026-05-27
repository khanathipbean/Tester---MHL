import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Test Case Dashboard",
    template: "%s | Test Case Dashboard",
  },
  description: "QA tracking foundation for test cases, runs, and defects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-[family-name:var(--font-inter)] text-foreground">
        <AuthSessionProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
