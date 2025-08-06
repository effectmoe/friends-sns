import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgressBarProvider } from '@/components/progress-bar-provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Friends SNS",
  description: "Connect with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ProgressBarProvider>
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
