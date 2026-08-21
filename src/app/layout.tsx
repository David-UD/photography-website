import type { Metadata, Viewport } from "next";
import "./globals.css";

import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorMeta } from "@/components/theme-color-meta";
import { siteConfig } from "@/site.config";
// Vercel Analytics
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { Readex_Pro } from "next/font/google";
import { cookies } from "next/headers";

const readexPro = Readex_Pro({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the initial theme on the server (SSR-readable cookie) so we can
  // set the `dark` class directly on <html> and avoid any inline <script>.
  const cookieStore = await cookies();
  const stored = cookieStore.get("theme")?.value;
  const initialDark = stored === "dark";

  return (
    <html
      lang="en"
      className={initialDark ? "dark" : undefined}
      suppressHydrationWarning
    >
      <body className={`${readexPro.className} antialiased`}>
        <NuqsAdapter>
          <TRPCReactProvider>
            <ThemeProvider>
              <ThemeColorMeta />
              <Toaster />
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </NuqsAdapter>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
