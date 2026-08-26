import type { Metadata } from "next";
import { DesignShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "Choose a visual direction — Decision Lab",
  description: "Compare three visual directions for the ØAADM3700 Decision Lab.",
};

export default function DesignPage() {
  return <DesignShowcase />;
}
