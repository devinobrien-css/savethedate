"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** A nav item resolved on the server and passed in from the layout. */
export type BottomNavItem = {
  label: string;
  href: string;
  icon: IconKey;
};

type IconKey = "home" | "calendar" | "map" | "attire" | "rsvp" | "gift";

// Simple line icons sized to inherit currentColor. Kept inline so the bar has
// no asset/runtime dependencies.
function Icon({ name }: { name: IconKey }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "attire":
      return (
        <svg {...common}>
          <path d="M9 3 5 6l2 3-1.5 2V21h13V11L17 9l2-3-4-3-3 2.5L9 3Z" />
        </svg>
      );
    case "rsvp":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <path d="m4 6.5 8 6 8-6" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="4" y="9.5" width="16" height="11" rx="1.5" />
          <path d="M3 9.5h18M12 9.5V21" />
          <path d="M12 9.5S10.5 4.5 8 5.2C6 5.8 6.5 9.5 12 9.5ZM12 9.5s1.5-5 4-4.3c2 .6 1.5 4.3-4 4.3Z" />
        </svg>
      );
  }
}

export default function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();

  // Keep the bar to guest-facing pages; admin dashboards have their own UI.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Site"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-v1-ink/10 bg-v1-paper/95 backdrop-blur supports-[backdrop-filter]:bg-v1-paper/80 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const external = item.href.startsWith("http");
          const active =
            !external &&
            (item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          const inner = (
            <span
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                active ? "text-v1-blush" : "text-v1-denim hover:text-v1-ink"
              }`}
            >
              <Icon name={item.icon} />
              <span className="text-[9px] uppercase tracking-[0.12em]">{item.label}</span>
            </span>
          );

          const cls = "flex flex-1 justify-center";

          return (
            <li key={item.href} className="flex flex-1">
              {external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cls}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
