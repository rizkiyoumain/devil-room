import { useRef, useState } from "react";
import { ImagePlus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/room/logo";
import { VeilAvatar } from "@/components/room/veil-avatar";
import { useIdentity } from "@/lib/room/identity";
import { compressAvatar, MAX_ALIAS_CHARS } from "@/lib/room/media";
import { moderateText } from "@/lib/room/filter";

export function Gate() {
  const guestId = useIdentity((s) => s.guestId);
  const alias = useIdentity((s) => s.alias);
  const avatarUrl = useIdentity((s) => s.avatarUrl);
  const setAlias = useIdentity((s) => s.setAlias);
  const setAvatarUrl = useIdentity((s) => s.setAvatarUrl);
  const shuffleAlias = useIdentity((s) => s.shuffleAlias);
  const enter = useIdentity((s) => s.enter);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onAvatarFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await compressAvatar(file);
      setAvatarUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memasang avatar.");
    } finally {
      setBusy(false);
    }
  }

  function onEnter() {
    const name = alias.trim();
    if (name.length < 2) {
      toast.error("Samaran minimal 2 huruf.");
      return;
    }
    const blocked = moderateText(name);
    if (blocked) {
      toast.error(blocked);
      return;
    }
    enter();
  }

  return (
    <main className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 gate-wash" />
      <section className="stagger-in relative w-full max-w-md">
        <Wordmark size="lg" className="justify-center" />
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
          Lounge anonim. Pilih samaran, pasang avatar, lalu masuk ke ruangan.
        </p>

        <div className="mt-8 rounded-xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative shrink-0"
              aria-label="Unggah avatar"
            >
              <VeilAvatar
                alias={alias}
                guestId={guestId}
                src={avatarUrl}
                size="lg"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <ImagePlus className="size-4 text-foreground" />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Samaran
              </p>
              <p className="truncate font-display text-2xl leading-tight text-foreground">
                {alias || "—"}
              </p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void onAvatarFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />

          <label className="mt-5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Nama samaran
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              value={alias}
              maxLength={MAX_ALIAS_CHARS}
              onChange={(e) => setAlias(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEnter();
              }}
              placeholder="Silent Veil"
              aria-label="Nama samaran"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={shuffleAlias}
              aria-label="Acak nama"
            >
              <Shuffle />
            </Button>
          </div>

          <label className="mt-4 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Avatar URL
          </label>
          <Input
            className="mt-2"
            value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            aria-label="Avatar URL"
          />
          <p className="mt-2 text-xs text-subtle">
            Unggah foto atau tempel tautan gambar. Identitas hanya tersimpan di perangkat ini.
          </p>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={onEnter}
            disabled={busy}
          >
            Masuk ruangan
          </Button>
        </div>
      </section>
    </main>
  );
}
