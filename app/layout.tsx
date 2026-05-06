import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackSave — AI Spend Audit",
  description: "Find out if you're overspending on AI tools. Get a free audit in 2 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}