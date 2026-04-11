import './global.css';
import { Plus_Jakarta_Sans, Space_Grotesk, Inter } from "next/font/google";
import Providers from "./providers";
import ConditionalHeader from "../shared/widgets/Header/ConditionalHeader";
import ProductComparisonBar from "../shared/components/product-comparison/ProductComparisonBar";

export const metadata = {
  title: 'EasyShop — Uganda\'s #1 Marketplace',
  description: 'Shop smarter, live better. Discover amazing products at unbeatable prices on EasyShop — Uganda\'s leading online marketplace.',
};

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${inter.variable}`}>
      <body style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        <Providers>
          <ConditionalHeader />
          {children}
          <ProductComparisonBar />
        </Providers>
      </body>
    </html>
  );
}
