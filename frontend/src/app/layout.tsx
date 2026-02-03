import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // We keep console.warn and console.error for production issues
}

export const metadata: Metadata = {
  title: {
    default: "Open Survey Monitor",
    template: "%s | Open Survey Monitor",
  },
  description: "Surveillance de sondages en temps réel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
