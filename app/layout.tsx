import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AK World | Free Online Tools",
  description: "AK World offers free online tools including What Is My IP and Find & Copy Files.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
