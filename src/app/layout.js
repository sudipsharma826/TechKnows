import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "./component/Header";
import Footer from "./component/Footer";
import { ThemeProvider } from "next-themes";
import ThemeCom from "./component/ThemeCom";
import StoreProvider from "./StoreProvider";

// Define metadata for the app
export const metadata = {
  title: "Sudip Sharma Blog",
  description: "Sudip Sharma Blog",
  icons: {
    icon: "/images/site_logo.png", // Ensure this is in the `public/images/` folder
  },
};

// Configure the Roboto font
const roboto = Roboto({
  weight: ["400",  "700",], // Include desired weights
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({ children }) {
  return (
    
      <html lang="en" suppressHydrationWarning>
        <body className={`${roboto.variable} antialiased`}>
          {/* StoreProvider for app-wide state management */}
          <StoreProvider>
            {/* ThemeProvider for dark/light mode */}
            <ThemeProvider>
              <ThemeCom>
                {/* App Header */}
                <Header />
                {/* Main App Content */}
                {children}
                {/* App Footer */}
                <Footer />
              </ThemeCom>
            </ThemeProvider>
          </StoreProvider>

          {/* Load external scripts */}
          {process.env.NEXT_PUBLIC_ADSENSE_SRC && (
            <script async src={process.env.NEXT_PUBLIC_ADSENSE_SRC}></script>
          )}
        </body>
      </html>
    
  );
}
