export const STICKER_IDS = [
  "ember",
  "horn",
  "veil",
  "rose",
  "moon",
  "crow",
  "wick",
  "key",
  "thorn",
  "mask",
  "night",
  "ash",
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

export function isStickerId(value: string): value is StickerId {
  return (STICKER_IDS as readonly string[]).includes(value);
}
