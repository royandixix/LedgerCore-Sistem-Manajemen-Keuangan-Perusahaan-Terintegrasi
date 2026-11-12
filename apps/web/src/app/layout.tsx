import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerCore | Enterprise Financial Management",
  description:
    "Enterprise Financial Management System powered by Next.js, NestJS, Prisma and Supabase PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
