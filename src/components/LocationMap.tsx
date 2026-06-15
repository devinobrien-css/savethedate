"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { mapPins, type MapPin, type MapPinKind } from "@/config/site";

/** Palette per pin kind (mirrors the v1 gold/navy tokens). */
const PIN_COLOR: Record<MapPinKind, string> = {
  venue: "#c8a23a", // gilded gold — the main event
  tentative: "#5e7896", // powder-blue — not yet confirmed
  landmark: "#2d4258", // navy — orientation point
};

/** Open a place in the device's default maps app (Apple Maps on Apple, else Google). */
function openInMaps(pin: MapPin) {
  const query = pin.mapsQuery ?? `${pin.lat},${pin.lng}`;
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  const url = isApple
    ? `https://maps.apple.com/?q=${encodeURIComponent(query)}&ll=${pin.lat},${pin.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Build the HTML for a teardrop pin + label chip used by L.divIcon. */
function pinHtml({ kind, label, sublabel, labelDir }: MapPin): string {
  const color = PIN_COLOR[kind];
  const dashed = kind === "tentative";
  const teardrop = `
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="lm-teardrop">
      <path d="M15 39C15 39 28 24 28 14A13 13 0 1 0 2 14C2 24 15 39 15 39Z"
        fill="${dashed ? "#fffdf7" : color}"
        stroke="${color}" stroke-width="2"
        ${dashed ? 'stroke-dasharray="3 3"' : ""} />
      <circle cx="15" cy="14" r="5" fill="${dashed ? color : "#fffdf7"}" />
    </svg>`;
  const dirClass = labelDir === "left" ? "lm-label--left" : "";
  return `
    <div class="lm-pin">
      ${teardrop}
      <span class="lm-label ${dirClass}">
        <strong>${label}</strong>
        ${sublabel ? `<em>${sublabel}</em>` : ""}
      </span>
    </div>`;
}

export default function LocationMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pins = mapPins.filter((p) => p.show !== false);
    if (!pins.length) return;

    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    import("leaflet").then((mod) => {
      const L = mod.default;
      if (cancelled || !el) return;

      map = L.map(el, {
        scrollWheelZoom: false, // don't hijack page scroll
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      const latlngs: [number, number][] = [];
      for (const p of pins) {
        latlngs.push([p.lat, p.lng]);
        // A pin is tappable (opens maps) once it has a query — tentative ones don't.
        const clickable = Boolean(p.mapsQuery);
        const marker = L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            html: pinHtml(p),
            className: clickable ? "lm-divicon lm-clickable" : "lm-divicon",
            iconSize: [30, 40],
            iconAnchor: [15, 39],
          }),
          keyboard: clickable,
          title: clickable ? `Open ${p.label} in maps` : undefined,
          // venue draws on top, tentative below
          zIndexOffset: p.kind === "venue" ? 1000 : 0,
        }).addTo(map);
        if (clickable) marker.on("click", () => openInMaps(p));
      }

      map.fitBounds(latlngs, { padding: [56, 56], maxZoom: 16 });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-[360px] w-full overflow-hidden rounded-lg border border-v1-ink/10 bg-v1-paper sm:h-[440px]"
      aria-label="Map showing The Penn Club, the ceremony, and Grand Central Terminal"
      role="img"
    />
  );
}
