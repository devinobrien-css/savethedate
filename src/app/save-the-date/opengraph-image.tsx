import { ogImage } from "@/lib/ogImage";

export { size, contentType } from "@/lib/ogImage";
export const alt = "Save the Date — Devin & Rebecca";

export default function Image() {
  return ogImage("Save the Date");
}
