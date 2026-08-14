"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { copyTemplateProcesses } from "@/lib/processTemplates";

// ログイン中の利用者は「入力の記録者」であって、実際に着手・完了した人とは
// 限らない(共有端末で代理入力するケースがあるため)。そのため着手者・完了者は
// 都度自由入力してもらい、ログイン名は初期値の候補として渡すだけにする。
export async function currentUserName(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) return "";
  const user = await prisma.user.findUnique({ where: { userId } });
  return user?.userName ?? "";
}

async function revalidateProductViews(productId: number) {
  revalidatePath(`/products/${productId}`);
  const product = await prisma.product.findUnique({ where: { productId } });
  if (product) revalidatePath(`/sites/${product.siteId}`);
  revalidatePath("/products");
}

export async function startProcess(processId: number, productId: number, performedBy: string) {
  const name = performedBy.trim() || "不明";
  const process = await prisma.process.findUnique({ where: { processId } });
  if (process && !process.startedAt) {
    await prisma.process.update({
      where: { processId },
      data: { startedAt: new Date(), startedBy: name },
    });
  }
  await revalidateProductViews(productId);
}

export async function completeProcess(processId: number, productId: number, performedBy: string) {
  const name = performedBy.trim() || "不明";
  const process = await prisma.process.findUnique({ where: { processId } });
  if (!process) return;
  await prisma.process.update({
    where: { processId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      completedBy: name,
      startedAt: process.startedAt ?? new Date(),
      startedBy: process.startedBy ?? name,
    },
  });
  await revalidateProductViews(productId);
}

// 完了操作の取り消し。着手記録(started_at/started_by)は誤操作ではないので残し、
// 完了状態だけ元に戻す(=着手中の状態に戻る)。
export async function uncompleteProcess(processId: number, productId: number) {
  await prisma.process.update({
    where: { processId },
    data: { isCompleted: false, completedAt: null, completedBy: null },
  });
  await revalidateProductViews(productId);
}

export async function applyTemplateToProduct(productId: number, formData: FormData) {
  const templateName = String(formData.get("templateName") ?? "").trim();
  if (!templateName) return;
  const existing = await prisma.process.count({ where: { productId } });
  if (existing === 0) {
    await copyTemplateProcesses(templateName, productId);
  }
  revalidatePath(`/products/${productId}`);
}
