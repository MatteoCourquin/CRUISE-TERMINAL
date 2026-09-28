import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rotterdam Ship Radar",
  description:
    "Arrivées et départs au quai Holland Amerikakade, Rotterdam.",
  applicationName: "Rotterdam Ship Radar",
  appleWebApp: {
    capable: true,
    title: "Ship Radar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-dvh overflow-hidden bg-canvas text-ink">
        <div className="mx-auto h-full w-full max-w-[640px] bg-surface">
          {children}
        </div>
      </body>
    </html>
  );
}
