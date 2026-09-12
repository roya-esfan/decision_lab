import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ØAADM3700 — Decision-Making Processes in Organizations",
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
