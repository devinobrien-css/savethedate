import { ogImage } from "@/lib/ogImage";

export { size, contentType } from "@/lib/ogImage";
export const alt = "Dress Code — Devin & Rebecca";

export default function Image() {
  return ogImage("Dress Code");
}
