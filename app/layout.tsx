"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeaderPaths = ["/", "/sign-in", "/sign-up"]; // Pages that shouldn't show the header
  const shouldShowHeader = !hideHeaderPaths.includes(pathname);

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-white text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen flex flex-col">
            {shouldShowHeader && (
              <div className="header-auth">
                <span className="header-auth-logo">Visita</span>
              </div>
            )}
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
