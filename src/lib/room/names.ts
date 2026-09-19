const ADJ = [
  "Silent",
  "Ashen",
  "Velvet",
  "Hollow",
  "Night",
  "Ember",
  "Pale",
  "Veiled",
  "Quiet",
  "Iron",
  "Dusk",
  "Ivory",
  "Sable",
  "Faint",
  "Low",
];

const NOUN = [
  "Horn",
  "Veil",
  "Rose",
  "Crow",
  "Wick",
  "Mask",
  "Key",
  "Thorn",
  "Ash",
  "Moon",
  "Lantern",
  "Cloak",
  "Spine",
  "Echo",
  "Wisp",
];

export function randomAlias(seed?: number): string {
  const n =
    seed ??
    (typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : Math.floor(Math.random() * 1e9));
  const adj = ADJ[n % ADJ.length];
  const noun = NOUN[Math.floor(n / ADJ.length) % NOUN.length];
  return `${adj} ${noun}`;
}

export function newGuestId(): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `veil_${id}`;
}

export function isGuestId(value: string): boolean {
  return /^veil_[a-z0-9-]{8,80}$/i.test(value);
}

export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}
