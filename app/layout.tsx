import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decision Lab — ØAADM3700",
  description:
    "Course schedule, sessions and classroom activities for ØAADM3700 Decision-Making Processes in Organizations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
