import { ThemeProvider } from "next-themes";
import { ErrorProvider } from "@/app/server/error-context";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "Visita",
  description: "Go to the market without even going to the market!",
};

export default function RootLayout({
  children,
} : {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <ErrorProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
