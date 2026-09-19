import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { moderateText } from "./filter";
import { isGuestId } from "./names";
import { isStickerId } from "./sticker-ids";
import {
  MAX_ALIAS_CHARS,
  MAX_AVATAR_URL,
  MAX_BODY_CHARS,
  isSafeMediaUrl,
} from "./media";
import { MEDIA_KINDS, type MediaKind, type RoomMember, type RoomMessage, type RoomState } from "./types";

const ONLINE_MS = 15_000;

const identitySchema = z.object({
  guestId: z.string().min(8).max(96),
  alias: z.string().min(2).max(MAX_ALIAS_CHARS),
  avatarUrl: z.string().max(MAX_AVATAR_URL).optional().default(""),
});

const postSchema = identitySchema.extend({
  body: z.string().max(MAX_BODY_CHARS).optional().default(""),
  mediaKind: z.enum(MEDIA_KINDS).nullable().optional(),
  mediaUrl: z.string().max(3_200_000).nullable().optional(),
  stickerId: z.string().max(32).nullable().optional(),
});

type MessageRow = {
  id: number;
  guest_id: string;
  alias: string;
  avatar_url: string | null;
  body: string;
  media_kind: string | null;
  media_url: string | null;
  sticker_id: string | null;
  created_at: string | Date;
};

type PresenceRow = {
  guest_id: string;
  alias: string;
  avatar_url: string | null;
  last_seen: string | Date;
};

function cleanAlias(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_ALIAS_CHARS);
}

function cleanAvatar(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  if (value.startsWith("data:image/") && value.length <= MAX_AVATAR_URL) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return value.slice(0, MAX_AVATAR_URL);
    }
  } catch {
    return null;
  }
  return null;
}

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function mapMessage(row: MessageRow): RoomMessage {
  const kind = MEDIA_KINDS.includes(row.media_kind as MediaKind)
    ? (row.media_kind as MediaKind)
    : null;
  return {
    id: row.id,
    guestId: row.guest_id,
    alias: row.alias,
    avatarUrl: row.avatar_url,
    body: row.body ?? "",
    mediaKind: kind,
    mediaUrl: row.media_url,
    stickerId: row.sticker_id,
    createdAt: toIso(row.created_at),
  };
}

function mapMember(row: PresenceRow, now: number): RoomMember {
  const lastSeen = toIso(row.last_seen);
  return {
    guestId: row.guest_id,
    alias: row.alias,
    avatarUrl: row.avatar_url,
    lastSeen,
    online: now - new Date(lastSeen).getTime() < ONLINE_MS,
  };
}

async function seedIfEmpty() {
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from room_messages`;
  if ((existing[0]?.n ?? 0) > 0) return;

  await sql`
    insert into room_messages (guest_id, alias, avatar_url, body, media_kind, sticker_id)
    values
      ('house', 'The House', null, 'Lounge terbuka. Pakai samaran, bukan nama asli.', null, null),
      ('house', 'The House', null, 'Kirim foto, klip, GIF, atau stiker. Lampiran bisa dibatalkan sebelum terkirim.', null, null),
      ('house', 'The House', null, '', 'sticker', 'veil')
  `;
}

export const getRoomState = createServerFn({ method: "GET" }).handler(
  async (): Promise<RoomState> => {
    await seedIfEmpty();
    const sql = await getSql();
    const messageRows = await sql<MessageRow>`
      select id, guest_id, alias, avatar_url, body, media_kind, media_url, sticker_id, created_at
      from room_messages
      order by created_at desc, id desc
      limit 120
    `;
    const presenceRows = await sql<PresenceRow>`
      select guest_id, alias, avatar_url, last_seen
      from room_presence
      order by last_seen desc
      limit 80
    `;
    const now = Date.now();
    const members = presenceRows.map((row) => mapMember(row, now));
    return {
      messages: messageRows.map(mapMessage).reverse(),
      members,
      onlineCount: members.filter((m) => m.online).length,
    };
  },
);

export const heartbeat = createServerFn({ method: "POST" })
  .validator(identitySchema)
  .handler(async ({ data }) => {
    if (!isGuestId(data.guestId)) throw new Error("Sesi tidak valid.");
    const alias = cleanAlias(data.alias);
    if (alias.length < 2) throw new Error("Samaran terlalu pendek.");
    const blocked = moderateText(alias);
    if (blocked) throw new Error(blocked);
    const avatar = cleanAvatar(data.avatarUrl);
    const sql = await getSql();
    await sql`
      insert into room_presence (guest_id, alias, avatar_url, last_seen)
      values (${data.guestId}, ${alias}, ${avatar}, now())
      on conflict (guest_id) do update set
        alias = excluded.alias,
        avatar_url = excluded.avatar_url,
        last_seen = now()
    `;
    return { ok: true as const };
  });

export const postMessage = createServerFn({ method: "POST" })
  .validator(postSchema)
  .handler(async ({ data }) => {
    if (!isGuestId(data.guestId)) throw new Error("Sesi tidak valid.");
    const alias = cleanAlias(data.alias);
    if (alias.length < 2) throw new Error("Samaran terlalu pendek.");
    const body = (data.body ?? "").trim();
    const blocked = moderateText(`${alias} ${body}`);
    if (blocked) throw new Error(blocked);

    const stickerId = data.stickerId && isStickerId(data.stickerId) ? data.stickerId : null;
    let mediaKind: MediaKind | null = data.mediaKind ?? null;
    let mediaUrl = data.mediaUrl ?? null;

    if (stickerId) {
      mediaKind = "sticker";
      mediaUrl = null;
    } else if (mediaKind && mediaUrl) {
      if (!isSafeMediaUrl(mediaUrl)) {
        throw new Error("Lampiran tidak bisa dikirim. Coba berkas lebih kecil atau tautan HTTPS.");
      }
      if (mediaKind === "sticker") {
        throw new Error("Stiker tidak valid.");
      }
    } else {
      mediaKind = null;
      mediaUrl = null;
    }

    if (!body && !mediaKind && !stickerId) {
      throw new Error("Tulis pesan atau lampirkan sesuatu.");
    }

    const avatar = cleanAvatar(data.avatarUrl);
    const sql = await getSql();
    await sql`
      insert into room_presence (guest_id, alias, avatar_url, last_seen)
      values (${data.guestId}, ${alias}, ${avatar}, now())
      on conflict (guest_id) do update set
        alias = excluded.alias,
        avatar_url = excluded.avatar_url,
        last_seen = now()
    `;
    const rows = await sql<MessageRow>`
      insert into room_messages (guest_id, alias, avatar_url, body, media_kind, media_url, sticker_id)
      values (
        ${data.guestId},
        ${alias},
        ${avatar},
        ${body},
        ${mediaKind},
        ${mediaUrl},
        ${stickerId}
      )
      returning id, guest_id, alias, avatar_url, body, media_kind, media_url, sticker_id, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Gagal mengirim.");
    return mapMessage(row);
  });
