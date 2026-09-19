import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newGuestId, randomAlias } from "./names";
import type { GuestIdentity } from "./types";

const BOOT_ID = "veil_boot";
const BOOT_ALIAS = "Silent Veil";

type IdentityStore = GuestIdentity & {
  setAlias: (alias: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  enter: () => void;
  leave: () => void;
  shuffleAlias: () => void;
};

export const useIdentity = create<IdentityStore>()(
  persist(
    (set, get) => ({
      guestId: BOOT_ID,
      alias: BOOT_ALIAS,
      avatarUrl: "",
      entered: false,
      setAlias: (alias) => set({ alias }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      enter: () => {
        const alias = get().alias.trim();
        if (alias.length < 2) return;
        const guestId = get().guestId === BOOT_ID ? newGuestId() : get().guestId;
        set({ entered: true, alias, guestId });
      },
      leave: () =>
        set({
          guestId: newGuestId(),
          alias: randomAlias(),
          avatarUrl: "",
          entered: false,
        }),
      shuffleAlias: () => set({ alias: randomAlias() }),
    }),
    {
      name: "devil-room-veil",
      version: 1,
      skipHydration: true,
    },
  ),
);
