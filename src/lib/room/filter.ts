const BLOCKED = [
  "porn",
  "xxx",
  "nsfw",
  "sex",
  "nude",
  "naked",
  "boob",
  "penis",
  "vagina",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "slut",
  "whore",
  "kill yourself",
  "kys",
  "suicide",
  "rape",
];

export function moderateText(input: string): string | null {
  const lowered = input.toLowerCase();
  for (const word of BLOCKED) {
    if (lowered.includes(word)) {
      return "Pesan itu tidak bisa dikirim di lounge ini.";
    }
  }
  return null;
}
