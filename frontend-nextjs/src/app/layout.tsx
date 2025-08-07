import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CleanLayer",
  description:
    "Remove image backgrounds instantly using state-of-the-art AI technology. Professional results in seconds with our U2-Net powered background removal tool.",
  keywords:
    "AI, background remover, image processing, transparent background, photo editing",
  authors: [{ name: "Ng Shen Zhi" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
