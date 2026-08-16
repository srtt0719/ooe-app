"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { categorize, extOf } from "@/lib/fileCategory";

export async function uploadFiles(siteId: number, formData: FormData) {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  for (const file of files) {
    const ext = extOf(file.name);
    const blob = await put(`sites/${siteId}/${Date.now()}-${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
    });
    await prisma.file.create({
      data: {
        siteId,
        fileName: file.name,
        fileType: ext ? ext.toUpperCase() : null,
        filePath: blob.pathname,
        category: categorize(file.name),
        originalName: file.name,
      },
    });
  }

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
