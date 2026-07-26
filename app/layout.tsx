import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "What Is My IP Address? | Free IP Lookup Tool | ak-world",
  description:
    "Find your public IP address instantly. View IPv4, IPv6, ISP, ASN, browser, operating system, device information, timezone, and more with ak-world.",
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
