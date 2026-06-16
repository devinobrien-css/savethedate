import Link from "next/link";
import { wedding } from "@/config/site";
import { logout } from "./actions";

/**
 * Shared admin chrome: the couple/date line + sign-out, and the primary tab
 * nav. To add a section, drop another entry in TABS and pass its id as `active`
 * from the new page — the highlight and routing follow automatically.
 */
const TABS = [
  { id: "rsvp", label: "RSVP List", href: "/admin" },
  { id: "guests", label: "Guests", href: "/admin/guests" },
  { id: "registry", label: "Registry", href: "/admin/registry" },
  { id: "emails", label: "Emails", href: "/admin/emails" },
  { id: "sms", label: "SMS", href: "/admin/sms" },
] as const;

export type AdminTab = (typeof TABS)[number]["id"];

export default function AdminHeader({ active }: { active: AdminTab }) {
  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          {wedding.partnerA} &amp; {wedding.partnerB} · {wedding.weddingDateLabel}
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-6 flex gap-1 border-b border-neutral-800">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px border-b-2 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${
                isActive
                  ? "border-neutral-100 text-neutral-100"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
