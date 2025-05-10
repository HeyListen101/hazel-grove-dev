import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import "./globals.css";
import PreventZoomWrapper from "@/components/prevent-zoom-wrapper";
import ResolutionGuard from "@/components/resolution-context";

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], 
  subsets: ["latin"], 
});

export const metadata = {
  title: "Visita",
  description: "Go to the market without even going to the market!",
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=yes',
};

export default function RootLayout({
  children,
} : {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className} suppressHydrationWarning>
       <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
      </head>
      <body 
        className="
          antialiased relative w-screen h-screen overflow-auto
          [&::-webkit-scrollbar]:h-1
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-400
        "
      >
        <PreventZoomWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ResolutionGuard minWidth={300} minHeight={400}>
              {children}
            </ResolutionGuard>
          </ThemeProvider>
        </PreventZoomWrapper>
      </body>
    </html>
  );
}
