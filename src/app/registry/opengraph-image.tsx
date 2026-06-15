import { ogImage } from "@/lib/ogImage";

export { size, contentType } from "@/lib/ogImage";
export const alt = "Registry — Devin & Rebecca";

export default function Image() {
  return ogImage("Registry");
}
