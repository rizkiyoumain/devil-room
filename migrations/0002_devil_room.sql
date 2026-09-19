-- Public anonymous lounge. Rows are unowned: aliases only, no accounts.
create table if not exists room_messages (
  id          serial primary key,
  guest_id    text not null,
  alias       text not null,
  avatar_url  text,
  body        text not null default '',
  media_kind  text,
  media_url   text,
  sticker_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists room_messages_created_idx
  on room_messages (created_at desc, id desc);

create table if not exists room_presence (
  guest_id    text primary key,
  alias       text not null,
  avatar_url  text,
  last_seen   timestamptz not null default now()
);
