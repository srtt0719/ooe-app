import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { extOf } from "@/lib/fileCategory";

// ブラウザ内で表示できる種類だけinline、それ以外(CAD等)はattachmentで
// 確実にダウンロードさせる。CADファイルはOS側のアプリ(AutoCAD等)に
// 関連付けられたファイルを開く操作でしか開けないため、ブラウザ内で直接
// 開くことはできない(ブラウザの仕様上の制約)。
const INLINE_EXTS = new Set(["pdf", "jpg", "jpeg", "png", "gif", "webp", "bmp"]);
const CONTENT_TYPE_OVERRIDES: Record<string, string> = {
  dwg: "application/acad",
  dxf: "image/vnd.dxf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse("unauthorized", { status: 401 });

  const { fileId: fileIdStr } = await params;
  const fileId = Number(fileIdStr);
  const file = await prisma.file.findUnique({ where: { fileId } });
  if (!file) return new NextResponse("not found", { status: 404 });

  const result = await get(file.filePath, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new NextResponse("not found", { status: 404 });
  }

  const name = file.originalName ?? file.fileName ?? "file";
  const ext = extOf(name);
  const disposition = INLINE_EXTS.has(ext) ? "inline" : "attachment";
  const asciiFallback = name.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": CONTENT_TYPE_OVERRIDES[ext] || result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
