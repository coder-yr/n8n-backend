import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "AI Viral Content Engine",
  description: "Production-grade SaaS for AI-powered viral content generation",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
