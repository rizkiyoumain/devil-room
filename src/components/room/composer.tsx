import { useEffect, useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import {
  Film,
  ImageIcon,
  Link2,
  Paperclip,
  Send,
  Sticker,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { StickerArt, STICKERS } from "@/lib/room/stickers";
import { isRemoteUrl, MAX_BODY_CHARS, prepareFile } from "@/lib/room/media";
import type { PendingAttachment } from "@/lib/room/types";
import { cn } from "@/lib/utils";

export function Composer({
  disabled,
  onSend,
  dragging,
  incomingFile,
  onIncomingHandled,
}: {
  disabled?: boolean;
  dragging?: boolean;
  incomingFile?: File | null;
  onIncomingHandled?: () => void;
  onSend: (payload: {
    body: string;
    attachment: PendingAttachment | null;
    stickerId: string | null;
  }) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [gifOpen, setGifOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState("");
  const [stickersOpen, setStickersOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const acceptRef = useRef("image/*,video/*,image/gif");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function resizeArea() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  async function attachFile(file: File | undefined) {
    if (!file) return;
    try {
      const prepared = await prepareFile(file);
      setAttachment(prepared);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal melampirkan berkas.");
    }
  }

  useEffect(() => {
    if (!incomingFile) return;
    void attachFile(incomingFile).finally(() => onIncomingHandled?.());
  }, [incomingFile]);

  async function submit(stickerId: string | null = null) {
    if (sending || disabled) return;
    const text = body.trim();
    if (!text && !attachment && !stickerId) return;
    setSending(true);
    try {
      await onSend({ body: text, attachment, stickerId });
      setBody("");
      setAttachment(null);
      setStickersOpen(false);
      requestAnimationFrame(resizeArea);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim.");
    } finally {
      setSending(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    void attachFile(e.dataTransfer.files?.[0]);
  }

  function confirmGif() {
    const url = gifUrl.trim();
    if (!isRemoteUrl(url)) {
      toast.error("Tempel tautan HTTP atau HTTPS.");
      return;
    }
    setAttachment({ kind: "gif", url, name: "GIF" });
    setGifOpen(false);
    setGifUrl("");
  }

  return (
    <form
      className={cn(
        "relative border-t border-border bg-background/80 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        dragging && "ring-2 ring-primary/40 ring-inset",
      )}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void submit();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {attachment ? (
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-card p-2 pr-2 shadow-card">
          {attachment.kind === "video" ? (
            <video
              src={attachment.url}
              className="size-14 rounded-sm object-cover"
              muted
            />
          ) : (
            <img
              src={attachment.url}
              alt=""
              className="size-14 rounded-sm object-cover outline outline-1 -outline-offset-1 outline-foreground/10"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">{attachment.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{attachment.kind}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Hapus lampiran"
            onClick={() => setAttachment(null)}
          >
            <X />
          </Button>
        </div>
      ) : null}

      <div className="flex items-end gap-1.5">
        <Popover open={attachOpen} onOpenChange={setAttachOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Lampirkan"
              disabled={disabled}
            >
              <Paperclip />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-1.5">
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm hover:bg-accent"
              onClick={() => {
                acceptRef.current = "image/*";
                fileRef.current?.click();
                setAttachOpen(false);
              }}
            >
              <ImageIcon className="size-4" /> Foto
            </button>
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm hover:bg-accent"
              onClick={() => {
                acceptRef.current = "video/*";
                fileRef.current?.click();
                setAttachOpen(false);
              }}
            >
              <Film className="size-4" /> Video
            </button>
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm hover:bg-accent"
              onClick={() => {
                acceptRef.current = "image/gif";
                fileRef.current?.click();
                setAttachOpen(false);
              }}
            >
              <ImageIcon className="size-4" /> GIF
            </button>
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm hover:bg-accent"
              onClick={() => {
                setAttachOpen(false);
                setGifOpen(true);
              }}
            >
              <Link2 className="size-4" /> Tautan GIF
            </button>
          </PopoverContent>
        </Popover>

        <Textarea
          ref={areaRef}
          value={body}
          maxLength={MAX_BODY_CHARS}
          placeholder="Tulis di lounge…"
          aria-label="Pesan"
          rows={1}
          disabled={disabled}
          className="max-h-36 min-h-11 flex-1 py-2.5"
          onChange={(e) => {
            setBody(e.target.value);
            resizeArea();
          }}
          onKeyDown={onKey}
          onPaste={(e) => {
            const file = e.clipboardData.files?.[0];
            if (file) {
              e.preventDefault();
              void attachFile(file);
            }
          }}
        />

        <Popover open={stickersOpen} onOpenChange={setStickersOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Stiker"
              disabled={disabled}
            >
              <Sticker />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <p className="px-1 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Veil marks
            </p>
            <div className="grid grid-cols-4 gap-1">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  className="flex size-16 items-center justify-center rounded-md p-1 hover:bg-accent"
                  onClick={() => void submit(sticker.id)}
                  aria-label={sticker.label}
                >
                  <StickerArt id={sticker.id} className="size-12" />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="submit"
          size="icon"
          aria-label="Kirim"
          disabled={disabled || sending || (!body.trim() && !attachment)}
        >
          <Send />
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={acceptRef.current}
        className="hidden"
        onChange={(e) => {
          void attachFile(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />

      <Dialog open={gifOpen} onOpenChange={setGifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tautan GIF</DialogTitle>
            <DialogDescription>
              Tempel URL GIF dari sumber yang kamu percayai.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={gifUrl}
            onChange={(e) => setGifUrl(e.target.value)}
            placeholder="https://…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmGif();
              }
            }}
          />
          <Button className="mt-4 w-full" type="button" onClick={confirmGif}>
            Pasang
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
