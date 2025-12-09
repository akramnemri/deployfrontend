// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import FitnessApp from '../components/FitnessApp'

// Add to your existing layout or create a new route

export const metadata: Metadata = {
  title: "Fitness ML Dashboard",
  description: "Batch predictions with Flask + Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}