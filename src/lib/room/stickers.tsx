import type { ReactNode } from "react";
import { STICKER_IDS, type StickerId } from "./sticker-ids";

function frame(children: ReactNode) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        className="fill-accent/80 stroke-border"
        strokeWidth="1"
      />
      {children}
    </svg>
  );
}

function EmberMark() {
  return frame(
    <>
      <path
        d="M32 16c4 8 12 12 12 22a12 12 0 1 1-24 0c0-10 8-14 12-22Z"
        className="stroke-primary"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M32 28c2 4 6 6 6 11a6 6 0 1 1-12 0c0-5 4-7 6-11Z"
        className="fill-primary/70"
      />
    </>,
  );
}

function HornMark() {
  return frame(
    <path
      d="M18 44c2-14 8-22 14-26 6 4 12 12 14 26M22 20c-4-6-8-8-12-8M42 20c4-6 8-8 12-8"
      className="stroke-foreground"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );
}

function VeilMark() {
  return frame(
    <path
      d="M20 20h24v8c0 10-5 18-12 22-7-4-12-12-12-22z"
      className="stroke-foreground"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );
}

function RoseMark() {
  return frame(
    <>
      <circle cx="32" cy="28" r="8" className="stroke-primary" strokeWidth="1.8" />
      <path
        d="M32 36v10M26 42c4-2 8-2 12 0"
        className="stroke-foreground"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>,
  );
}

function MoonMark() {
  return frame(
    <path
      d="M38 18a14 14 0 1 0 8 24 12 12 0 1 1-8-24Z"
      className="stroke-foreground"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );
}

function CrowMark() {
  return frame(
    <path
      d="M16 36c8-2 14-10 18-18 2 6 8 12 16 14-8 2-12 8-12 14H28c-4-4-8-8-12-10Z"
      className="stroke-foreground"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );
}

function WickMark() {
  return frame(
    <>
      <path
        d="M26 46h12l-2-16H28z"
        className="stroke-foreground"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M32 18c3 5 8 7 8 12a8 8 0 1 1-16 0c0-5 5-7 8-12Z"
        className="stroke-primary"
        strokeWidth="1.8"
      />
    </>,
  );
}

function KeyMark() {
  return frame(
    <>
      <circle cx="26" cy="28" r="7" className="stroke-foreground" strokeWidth="1.8" />
      <path
        d="M32 30l16 10v4h-4v-3l-4 2v-3l-4 2"
        className="stroke-foreground"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </>,
  );
}

function ThornMark() {
  return frame(
    <path
      d="M32 14l4 16 12 4-12 4-4 12-4-12-12-4 12-4z"
      className="stroke-primary"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );
}

function MaskMark() {
  return frame(
    <path
      d="M16 28c4-8 12-12 16-12s12 4 16 12c0 8-6 14-16 16-10-2-16-8-16-16Z"
      className="stroke-foreground"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );
}

function NightMark() {
  return frame(
    <>
      <circle cx="32" cy="32" r="12" className="stroke-foreground" strokeWidth="1.8" />
      <path d="M32 20v24M20 32h24" className="stroke-primary/80" strokeWidth="1.4" />
    </>,
  );
}

function AshMark() {
  return frame(
    <>
      <circle cx="24" cy="36" r="3" className="fill-muted-foreground" />
      <circle cx="34" cy="24" r="2.4" className="fill-primary" />
      <circle cx="42" cy="38" r="2" className="fill-foreground/80" />
      <circle cx="30" cy="42" r="1.6" className="fill-muted-foreground" />
    </>,
  );
}

const MARKS: Record<StickerId, () => ReactNode> = {
  ember: EmberMark,
  horn: HornMark,
  veil: VeilMark,
  rose: RoseMark,
  moon: MoonMark,
  crow: CrowMark,
  wick: WickMark,
  key: KeyMark,
  thorn: ThornMark,
  mask: MaskMark,
  night: NightMark,
  ash: AshMark,
};

export const STICKERS = STICKER_IDS.map((id) => ({
  id,
  label: id[0].toUpperCase() + id.slice(1),
  Mark: MARKS[id],
}));

export function StickerArt({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const found = STICKERS.find((s) => s.id === id);
  if (!found) return null;
  const Mark = found.Mark;
  return (
    <span className={className}>
      <Mark />
    </span>
  );
}

export { isStickerId, STICKER_IDS, type StickerId } from "./sticker-ids";
