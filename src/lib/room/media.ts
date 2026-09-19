import type { PendingAttachment } from "./types";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_PERSIST_BYTES = 2_400_000;
export const MAX_BODY_CHARS = 1600;
export const MAX_ALIAS_CHARS = 24;
export const MAX_AVATAR_URL = 160_000;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}

export function isRemoteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeMediaUrl(value: string): boolean {
  if (value.startsWith("data:image/") || value.startsWith("data:video/")) {
    return dataUrlBytes(value) <= MAX_PERSIST_BYTES;
  }
  return isRemoteUrl(value) && value.length <= 2000;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Gagal membaca berkas."));
    };
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return readAsDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const qualities = [0.82, 0.7, 0.58, 0.46];
  for (const quality of qualities) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (dataUrlBytes(url) <= MAX_PERSIST_BYTES) return url;
  }
  const last = canvas.toDataURL("image/jpeg", 0.4);
  if (dataUrlBytes(last) > MAX_PERSIST_BYTES) {
    throw new Error("Foto masih terlalu besar setelah diperkecil. Coba gambar lain.");
  }
  return last;
}

export async function prepareFile(file: File): Promise<PendingAttachment> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Maksimum unggah ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  }

  const type = file.type || "";
  if (type === "image/gif") {
    if (file.size > MAX_PERSIST_BYTES) {
      throw new Error("GIF terlalu besar. Tempel tautan GIF, atau pilih berkas di bawah 2 MB.");
    }
    return { kind: "gif", url: await readAsDataUrl(file), name: file.name };
  }

  if (type.startsWith("image/")) {
    return { kind: "photo", url: await compressImage(file), name: file.name };
  }

  if (type.startsWith("video/")) {
    if (file.size > MAX_PERSIST_BYTES) {
      throw new Error(
        "Klip harus di bawah 2.4 MB agar bisa dibagikan. Pilih klip lebih pendek, atau kirim tautan.",
      );
    }
    return { kind: "video", url: await readAsDataUrl(file), name: file.name };
  }

  throw new Error("Hanya foto, video, dan GIF yang bisa dilampirkan.");
}

export async function compressAvatar(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Maksimum unggah ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Avatar harus berupa gambar.");
  }
  const bitmap = await createImageBitmap(file);
  const maxEdge = 256;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Gagal memproses avatar.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.78);
  if (url.length > MAX_AVATAR_URL) {
    const smaller = canvas.toDataURL("image/jpeg", 0.55);
    if (smaller.length > MAX_AVATAR_URL) {
      throw new Error("Avatar terlalu besar. Coba foto lain.");
    }
    return smaller;
  }
  return url;
}
