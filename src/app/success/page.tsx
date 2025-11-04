import SuccessPage from "@/components/SuccessPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Result - Photobooth by Siliwangi Code Developer (SICODEV)",
  description:
    "Review and download your photobooth result from Siliwangi Code Developer (SICODEV).",
};

const SuccessRoute = () => {
  return <SuccessPage />;
};

export default SuccessRoute;
