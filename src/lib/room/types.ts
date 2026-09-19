export const MEDIA_KINDS = ["photo", "video", "gif", "sticker"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export type RoomMessage = {
  id: number;
  guestId: string;
  alias: string;
  avatarUrl: string | null;
  body: string;
  mediaKind: MediaKind | null;
  mediaUrl: string | null;
  stickerId: string | null;
  createdAt: string;
};

export type RoomMember = {
  guestId: string;
  alias: string;
  avatarUrl: string | null;
  lastSeen: string;
  online: boolean;
};

export type RoomState = {
  messages: RoomMessage[];
  members: RoomMember[];
  onlineCount: number;
};

export type PendingAttachment = {
  kind: Exclude<MediaKind, "sticker">;
  url: string;
  name: string;
};

export type GuestIdentity = {
  guestId: string;
  alias: string;
  avatarUrl: string;
  entered: boolean;
};
