import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ØAADM3700 — Judgement and decision making in organizations",
  description:
    "Course schedule, sessions, readings and classroom activities for ØAADM3700.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
