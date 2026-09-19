import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { getRoomState, heartbeat, postMessage } from "@/lib/room/api";
import { useIdentity } from "@/lib/room/identity";
import type { PendingAttachment } from "@/lib/room/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Composer } from "@/components/room/composer";
import { Gate } from "@/components/room/gate";
import { Wordmark } from "@/components/room/logo";
import { MessageCard } from "@/components/room/message-card";
import { ProfileSheet } from "@/components/room/profile-sheet";
import { Roster } from "@/components/room/roster";
import { VeilAvatar } from "@/components/room/veil-avatar";

export function RoomApp() {
  const entered = useIdentity((s) => s.entered);
  const guestId = useIdentity((s) => s.guestId);
  const alias = useIdentity((s) => s.alias);
  const avatarUrl = useIdentity((s) => s.avatarUrl);
  const leave = useIdentity((s) => s.leave);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useIdentity.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <GateSplash />;
  }

  if (!entered) return <Gate />;

  return (
    <Lounge
      guestId={guestId}
      alias={alias}
      avatarUrl={avatarUrl}
      onLeave={leave}
    />
  );
}

function GateSplash() {
  return (
    <main className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 gate-wash" />
      <section className="relative w-full max-w-md">
        <Wordmark size="lg" className="justify-center" />
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
          Lounge anonim. Pilih samaran, pasang avatar, lalu masuk ke ruangan.
        </p>
        <div className="mt-8 rounded-xl bg-card p-5 shadow-card">
          <p className="font-display text-2xl leading-tight text-foreground">Silent Veil</p>
          <p className="mt-3 text-sm text-muted-foreground">Membuka lounge…</p>
        </div>
      </section>
    </main>
  );
}

function Lounge({
  guestId,
  alias,
  avatarUrl,
  onLeave,
}: {
  guestId: string;
  alias: string;
  avatarUrl: string;
  onLeave: () => void;
}) {
  const queryClient = useQueryClient();
  const [rosterOpen, setRosterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [incomingFile, setIncomingFile] = useState<File | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const room = useQuery({
    queryKey: ["room"],
    queryFn: () => getRoomState(),
    refetchInterval: 2500,
  });

  useEffect(() => {
    const beat = () => {
      void heartbeat({ data: { guestId, alias, avatarUrl } });
    };
    beat();
    const id = window.setInterval(beat, 5000);
    return () => window.clearInterval(id);
  }, [guestId, alias, avatarUrl]);

  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [room.data?.messages.length]);

  const send = useMutation({
    mutationFn: async (payload: {
      body: string;
      attachment: PendingAttachment | null;
      stickerId: string | null;
    }) => {
      return postMessage({
        data: {
          guestId,
          alias,
          avatarUrl,
          body: payload.body,
          mediaKind: payload.stickerId
            ? "sticker"
            : payload.attachment?.kind ?? null,
          mediaUrl: payload.stickerId ? null : payload.attachment?.url ?? null,
          stickerId: payload.stickerId,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["room"] });
    },
  });

  const messages = room.data?.messages ?? [];
  const members = room.data?.members ?? [];
  const onlineCount = room.data?.onlineCount ?? 1;
  const me = { guestId, alias, avatarUrl, entered: true };

  const roster = (
    <Roster
      me={me}
      members={members}
      onlineCount={onlineCount}
      onEdit={() => {
        setRosterOpen(false);
        setProfileOpen(true);
      }}
      onLeave={onLeave}
    />
  );

  return (
    <div
      className="flex h-dvh overflow-hidden bg-background"
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setIncomingFile(file);
      }}
    >
      <aside className="hidden w-80 shrink-0 border-r border-border lg:block">
        {roster}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-3 lg:px-5">
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Anggota"
              onClick={() => setRosterOpen(true)}
            >
              <Users />
            </Button>
            <Wordmark size="sm" />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Percakapan lounge
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs tabular-nums text-subtle sm:inline">
              {onlineCount} daring
            </span>
            <button
              type="button"
              className="flex items-center"
              onClick={() => setProfileOpen(true)}
              aria-label="Profil"
            >
              <VeilAvatar
                alias={alias}
                guestId={guestId}
                src={avatarUrl}
                size="sm"
              />
            </button>
          </div>
        </header>

        <div
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-y-auto px-3 py-5 lg:px-8"
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
        >
          {room.isLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Membuka lounge…
            </p>
          ) : messages.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Tenang. Ruangan menunggu suaramu.
            </p>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  mine={message.guestId === guestId}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          {dragging ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-full mb-2 rounded-lg bg-card px-4 py-6 text-center text-sm text-muted-foreground shadow-card">
              Lepaskan untuk melampirkan
            </div>
          ) : null}
          <Composer
            dragging={dragging}
            disabled={send.isPending}
            incomingFile={incomingFile}
            onIncomingHandled={() => setIncomingFile(null)}
            onSend={async (payload) => {
              await send.mutateAsync(payload);
            }}
          />
        </div>
      </section>

      <Sheet open={rosterOpen} onOpenChange={setRosterOpen}>
        <SheetContent side="left" className="p-0">
          {roster}
        </SheetContent>
      </Sheet>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
