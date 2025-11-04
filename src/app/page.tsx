import CapturePage from "@/components/CapturePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capture - Photobooth by Siliwangi Code Developer (SICODEV)",
  description:
    "Photobooth capture page - take your photos with Siliwangi Code Developer (SICODEV).",
};

export default function Home() {
  return <CapturePage />;
}
