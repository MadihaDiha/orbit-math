import type { Metadata } from "next";
import { BimoIntro } from "@/components/opening/BimoIntro";

export const metadata: Metadata = { title: "Kenalan dengan Bimo" };

export default function BimoIntroPage() {
  return <BimoIntro />;
}
