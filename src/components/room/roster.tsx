import { LogOut, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wordmark } from "@/components/room/logo";
import { VeilAvatar } from "@/components/room/veil-avatar";
import type { GuestIdentity, RoomMember } from "@/lib/room/types";
import { cn } from "@/lib/utils";

export function Roster({
  me,
  members,
  onlineCount,
  onEdit,
  onLeave,
}: {
  me: GuestIdentity;
  members: RoomMember[];
  onlineCount: number;
  onEdit: () => void;
  onLeave: () => void;
}) {
  const others = members.filter((m) => m.guestId !== me.guestId);
  const sorted = [...others].sort((a, b) => Number(b.online) - Number(a.online));

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="px-5 pt-6 pb-4">
        <Wordmark size="sm" />
        <p className="mt-2 text-sm text-muted-foreground">Lounge anonim</p>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent p-3 shadow-card">
          <VeilAvatar
            alias={me.alias}
            guestId={me.guestId}
            src={me.avatarUrl}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{me.alias}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="ember-dot size-1.5 rounded-full bg-primary" />
              Daring
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Sunting profil"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
        </div>
      </div>

      <Separator className="mt-5" />

      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Anggota
        </p>
        <span className="text-xs tabular-nums text-subtle">{onlineCount} daring</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5 pb-4">
          {sorted.length === 0 ? (
            <li className="px-3 py-6 text-sm text-muted-foreground">
              Kamu sendirian di lounge. Tunggu yang lain, atau kirim pesan pertama.
            </li>
          ) : (
            sorted.map((member) => (
              <li
                key={member.guestId}
                className="flex items-center gap-3 rounded-md px-3 py-2"
              >
                <span className="relative">
                  <VeilAvatar
                    alias={member.alias}
                    guestId={member.guestId}
                    src={member.avatarUrl}
                    size="sm"
                  />
                  <span
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 size-2 rounded-full outline outline-2 outline-card",
                      member.online ? "bg-primary" : "bg-subtle",
                    )}
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{member.alias}</p>
                  <p className="text-xs text-subtle">
                    {member.online ? "Daring" : "Tidak terlihat"}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={onLeave}>
          <LogOut />
          Ganti samaran
        </Button>
      </div>
    </div>
  );
}
