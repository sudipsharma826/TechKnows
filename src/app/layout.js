import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./component/Header";
import Footer from "./component/Footer";
import { ThemeProvider } from "next-themes";
import ThemeCom from "./component/ThemeCom";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "./StoreProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Sudip Sharma Blog</title>
          <meta name="description" content="Sudip Sharma Blog" />
          <link rel="icon" href="images/site_logo.png" />
          <script async src={process.env.NEXT_PUBLIC_ADSENSE_SRC}></script>
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Use PersistGate only on the client-side */}
          <StoreProvider>

              <ThemeProvider>
                <ThemeCom>
                  <Header />
                  {children}
                  <Footer />
                </ThemeCom>
              </ThemeProvider>
          </StoreProvider>
          
           
        </body>
      </html>
    </ClerkProvider>
  );
}
