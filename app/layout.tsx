import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LendX - Loan Tracking Application",
  description: "Multi-user loan tracking with compound interest calculations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

