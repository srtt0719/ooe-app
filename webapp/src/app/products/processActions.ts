"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { copyTemplateProcesses } from "@/lib/processTemplates";

async function currentUserName(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) return "不明";
  const user = await prisma.user.findUnique({ where: { userId } });
  return user?.userName ?? "不明";
}

export async function startProcess(processId: number, productId: number) {
  const name = await currentUserName();
  const process = await prisma.process.findUnique({ where: { processId } });
  if (process && !process.startedAt) {
    await prisma.process.update({
      where: { processId },
      data: { startedAt: new Date(), startedBy: name },
    });
  }
  revalidatePath(`/products/${productId}`);
  const product = await prisma.product.findUnique({ where: { productId } });
  if (product) revalidatePath(`/sites/${product.siteId}`);
  revalidatePath("/products");
}

export async function completeProcess(processId: number, productId: number) {
  const name = await currentUserName();
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
  revalidatePath(`/products/${productId}`);
  const product = await prisma.product.findUnique({ where: { productId } });
  if (product) revalidatePath(`/sites/${product.siteId}`);
  revalidatePath("/products");
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
