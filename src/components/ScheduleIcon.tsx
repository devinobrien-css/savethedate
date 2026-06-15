/**
 * Line-art icons for the wedding-day timeline. Each draws in `currentColor`
 * so it inherits the marker's text color. Keyed by name to keep the schedule
 * config (site.ts → daySchedule) free of markup.
 */
export type ScheduleIconName =
  | "calendar"
  | "toast"
  | "bus"
  | "rings"
  | "martini"
  | "utensils"
  | "music"
  | "train"
  | "car"
  | "moon"
  | "coffee";

const paths: Record<ScheduleIconName, React.ReactNode> = {
  // Calendar — the date
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
    </>
  ),
  // Two champagne flutes clinking — the day begins
  toast: (
    <>
      <g transform="rotate(-10 8 5)">
        <path d="M6.6 3.5h3l-.4 5.5a1.1 1.1 0 0 1-2.2 0z" />
        <path d="M8 9v7.5" />
        <path d="M6 16.5h4" />
      </g>
      <g transform="rotate(10 16 5)">
        <path d="M14.4 3.5h3l-.4 5.5a1.1 1.1 0 0 1-2.2 0z" />
        <path d="M16 9v7.5" />
        <path d="M14 16.5h4" />
      </g>
    </>
  ),
  // Shuttle bus
  bus: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M9 4.5v5M15 4.5v5" />
      <circle cx="8" cy="20" r="1.4" />
      <circle cx="16" cy="20" r="1.4" />
    </>
  ),
  // Two interlocking wedding bands with a small diamond
  rings: (
    <>
      <circle cx="9" cy="15" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M13.5 3.2l1.5 2-1.5 2-1.5-2z" />
    </>
  ),
  // Martini glass — cocktail hour
  martini: (
    <>
      <path d="M19 4H5l7 8z" />
      <path d="M12 12v8" />
      <path d="M8 20h8" />
    </>
  ),
  // Fork & knife — dinner
  utensils: (
    <>
      <path d="M3 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
      <path d="M6 10v12" />
      <path d="M19 14V2a4 4 0 0 0-4 4v5a2 2 0 0 0 2 2h2zm0 0v8" />
    </>
  ),
  // Musical notes — dancing
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="2.8" />
      <circle cx="17" cy="16" r="2.8" />
    </>
  ),
  // Train / tram front — take the train
  train: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="2.5" />
      <path d="M4 11h16M12 3v8" />
      <path d="m8 18-2 3M16 18l2 3" />
      <circle cx="8.5" cy="14.5" r="0.6" />
      <circle cx="15.5" cy="14.5" r="0.6" />
    </>
  ),
  // Car — driving
  car: (
    <>
      <path d="M5 17H3v-4l2-5h11l2.5 3.5L21 12v5h-2" />
      <path d="M8 17h8" />
      <path d="M5 11h13" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  // Crescent moon — overnight stay
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  // Steaming cup — morning-after brunch
  coffee: (
    <>
      <path d="M17 9h1.5a3 3 0 0 1 0 6H17" />
      <path d="M3 9h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
      <path d="M7 2.5v2M11 2.5v2" />
    </>
  ),
};

export default function ScheduleIcon({
  name,
  className,
}: {
  readonly name: ScheduleIconName;
  readonly className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
