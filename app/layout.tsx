import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Е-Учење | Платформа за студенти",
  description: "Платформа за е-учење за студенти и наставници",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-surface-50 text-slate-800`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
