import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ResolutionGuard from "@/components/resolution-context";
import { EditCooldownProvider } from "@/components/cooldown-context";

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], 
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
    <html lang="en" className={poppins.className} suppressHydrationWarning>
      <body 
        className="
          antialiased relative w-screen h-screen overflow-auto
          [&::-webkit-scrollbar]:h-1
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-400
        "
      >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ResolutionGuard minWidth={375} minHeight={375}>
              <EditCooldownProvider>
                {children}
              </EditCooldownProvider>
            </ResolutionGuard>
          </ThemeProvider>
      </body>
    </html>
  );
}
