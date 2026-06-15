import { ogImage } from "@/lib/ogImage";

export { size, contentType } from "@/lib/ogImage";
export const alt = "Location & Time — Devin & Rebecca";

export default function Image() {
  return ogImage("Location & Time");
}
