"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { categorize, extOf } from "@/lib/fileCategory";

// ブラウザからBlobへ直接アップロードした後、DBにファイル情報だけを記録する。
// (Server Actionはリクエスト本文が既定で1MBまでのため、写真や図面の実体は経由させない)
export async function recordUploadedFile(
  siteId: number,
  info: { fileName: string; pathname: string },
) {
  const ext = extOf(info.fileName);
  await prisma.file.create({
    data: {
      siteId,
      fileName: info.fileName,
      fileType: ext ? ext.toUpperCase() : null,
      filePath: info.pathname,
      category: categorize(info.fileName),
      originalName: info.fileName,
    },
  });

  revalidatePath(`/sites/${siteId}/files`);
  revalidatePath(`/sites/${siteId}`);
}

export async function updateFileMemo(fileId: number, siteId: number, formData: FormData) {
  const memo = String(formData.get("memo") ?? "").trim() || null;
  await prisma.file.update({ where: { fileId }, data: { memo } });
  revalidatePath(`/sites/${siteId}/files`);
}

export async function deleteFile(fileId: number, siteId: number) {
  const file = await prisma.file.findUnique({ where: { fileId } });
  if (!file) return;
  await del(file.filePath);
  await prisma.file.delete({ where: { fileId } });
  revalidatePath(`/sites/${siteId}/files`);
  revalidatePath(`/sites/${siteId}`);
}
