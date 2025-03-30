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
  // Keep track of paths that should have no layout
  const noLayoutPaths = ["/", "/sign-in", "/sign-up"];
  const shouldApplyLayout = !noLayoutPaths.includes(pathname);

  return (
    <html lang="en">
      <body className={geistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}