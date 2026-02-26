import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Create and share memes with the community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-[#e0e0e0] font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
