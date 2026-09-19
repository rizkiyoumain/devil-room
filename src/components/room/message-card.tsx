import { useState } from "react";
import { StickerArt } from "@/lib/room/stickers";
import type { RoomMessage } from "@/lib/room/types";
import { cn } from "@/lib/utils";
import { VeilAvatar } from "@/components/room/veil-avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MessageCard({
  message,
  mine,
}: {
  message: RoomMessage;
  mine: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasVisual =
    (message.mediaKind === "photo" ||
      message.mediaKind === "gif" ||
      message.mediaKind === "video") &&
    Boolean(message.mediaUrl);

  return (
    <article
      className={cn(
        "flex max-w-[min(100%,36rem)] gap-3",
        mine ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      <VeilAvatar
        alias={message.alias}
        guestId={message.guestId}
        src={message.avatarUrl}
        size="sm"
        className="mt-1 shrink-0"
      />
      <div className={cn("min-w-0", mine ? "items-end" : "items-start")}>
        <div className={cn("mb-1 flex items-baseline gap-2", mine && "flex-row-reverse")}>
          <span className="text-xs font-medium text-muted-foreground">
            {message.alias}
          </span>
          <time
            dateTime={message.createdAt}
            className="text-xs tabular-nums text-subtle"
          >
            {formatTime(message.createdAt)}
          </time>
        </div>
        <div
          className={cn(
            "rounded-lg px-3 py-2.5 shadow-card",
            mine ? "rounded-tr-sm bg-accent" : "rounded-tl-sm bg-card",
          )}
        >
          {message.stickerId ? (
            <StickerArt id={message.stickerId} className="block size-20" />
          ) : null}
          {hasVisual && message.mediaKind === "video" ? (
            <video
              src={message.mediaUrl ?? undefined}
              controls
              className="mt-1 max-h-64 w-full rounded-md bg-background outline outline-1 -outline-offset-1 outline-foreground/10"
            />
          ) : null}
          {hasVisual && message.mediaKind !== "video" ? (
            <button
              type="button"
              className="mt-1 block w-full overflow-hidden rounded-md"
              onClick={() => setOpen(true)}
            >
              <img
                src={message.mediaUrl ?? ""}
                alt=""
                className="max-h-64 w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
              />
            </button>
          ) : null}
          {message.body ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {message.body}
            </p>
          ) : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(100%-2rem,42rem)] bg-background p-3">
          <DialogTitle className="sr-only">Lampiran</DialogTitle>
          <img
            src={message.mediaUrl ?? ""}
            alt=""
            className="max-h-[80dvh] w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </article>
  );
}
