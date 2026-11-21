import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "R4TourGuide — Eksplorasi Raja Ampat & Destinasi Terbaik Indonesia",
  description:
    "Platform perjalanan dan pemandu lokal terkurasi dengan nuansa eksotis Raja Ampat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${jakartaSans.className} antialiased bg-[#F7FAFC] text-slate-900`}>
        {children}
      </body>
    </html>
  );
}