import type { Metadata } from "next";
import { DesignShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "Homepage directions — ØAADM3700",
  description: "Compare three student-focused homepage directions for ØAADM3700.",
};

export default function DesignPage() {
  return <DesignShowcase />;
}
