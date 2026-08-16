"use server";

import { revalidatePath } from "next/cache";
import { del, get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { categorize, extOf } from "@/lib/fileCategory";
import { extractDxfText, extractPdfText } from "@/lib/extractText";

// DXF/PDFは中身のテキストを抽出し、後から全文検索できるようにする(仕様書5-6)。
// 抽出に失敗しても、ファイル自体の登録は必ず成功させる(通知同様、任意機能で全体を止めない方針)。
async function tryExtractText(pathname: string, ext: string): Promise<string | null> {
  if (ext !== "dxf" && ext !== "pdf") return null;
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    const buf = Buffer.from(await new Response(result.stream).arrayBuffer());
    return ext === "dxf" ? extractDxfText(buf) : await extractPdfText(buf);
  } catch (e) {
    console.error("text extraction failed", e);
    return null;
  }
}

// ブラウザからBlobへ直接アップロードした後、DBにファイル情報を記録する。
// (Server Actionはリクエスト本文が既定で1MBまでのため、写真や図面の実体は経由させない)
export async function recordUploadedFile(
  siteId: number,
  info: { fileName: string; pathname: string },
) {
  const ext = extOf(info.fileName);
  const extractedText = await tryExtractText(info.pathname, ext);

  await prisma.file.create({
    data: {
      siteId,
      fileName: info.fileName,
      fileType: ext ? ext.toUpperCase() : null,
      filePath: info.pathname,
      category: categorize(info.fileName),
      originalName: info.fileName,
      extractedText,
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
