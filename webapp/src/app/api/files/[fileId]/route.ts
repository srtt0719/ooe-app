import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

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

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.originalName ?? file.fileName ?? "file")}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
