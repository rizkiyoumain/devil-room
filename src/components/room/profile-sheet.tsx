import { useRef, useState } from "react";
import { ImagePlus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VeilAvatar } from "@/components/room/veil-avatar";
import { useIdentity } from "@/lib/room/identity";
import { compressAvatar, MAX_ALIAS_CHARS } from "@/lib/room/media";
import { moderateText } from "@/lib/room/filter";

export function ProfileSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const guestId = useIdentity((s) => s.guestId);
  const alias = useIdentity((s) => s.alias);
  const avatarUrl = useIdentity((s) => s.avatarUrl);
  const setAlias = useIdentity((s) => s.setAlias);
  const setAvatarUrl = useIdentity((s) => s.setAvatarUrl);
  const shuffleAlias = useIdentity((s) => s.shuffleAlias);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onAvatarFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      setAvatarUrl(await compressAvatar(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memasang avatar.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
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
    setAlias(name);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0">
        <SheetHeader>
          <SheetTitle>Profil</SheetTitle>
        </SheetHeader>
        <div className="px-5 pb-6">
          <button
            type="button"
            className="group relative"
            onClick={() => fileRef.current?.click()}
            aria-label="Unggah avatar"
          >
            <VeilAvatar alias={alias} guestId={guestId} src={avatarUrl} size="lg" />
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
              <ImagePlus className="size-4" />
            </span>
          </button>
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
            Samaran
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              value={alias}
              maxLength={MAX_ALIAS_CHARS}
              onChange={(e) => setAlias(e.target.value)}
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
          />

          <Button className="mt-6 w-full" onClick={save} disabled={busy}>
            Simpan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
