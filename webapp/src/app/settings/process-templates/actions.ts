"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateTemplateRow(templateId: number, formData: FormData) {
  const processName = String(formData.get("processName") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 0);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const alertMessage = String(formData.get("alertMessage") ?? "").trim() || null;
  if (!processName) return;
  await prisma.processTemplate.update({
    where: { templateId },
    data: { processName, weight, sortOrder, alertMessage },
  });
  revalidatePath("/settings/process-templates");
}

export async function deleteTemplateRow(templateId: number) {
  await prisma.processTemplate.delete({ where: { templateId } });
  revalidatePath("/settings/process-templates");
}

export async function addTemplateRow(templateName: string, formData: FormData) {
  const processName = String(formData.get("processName") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 0);
  if (!processName) return;
  const maxSort = await prisma.processTemplate.aggregate({
    where: { templateName },
    _max: { sortOrder: true },
  });
  await prisma.processTemplate.create({
    data: {
      templateName,
      processName,
      weight,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/settings/process-templates");
}

export async function createTemplate(formData: FormData) {
  const templateName = String(formData.get("templateName") ?? "").trim();
  const processName = String(formData.get("processName") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 100);
  if (!templateName || !processName) return;
  await prisma.processTemplate.create({
    data: { templateName, processName, weight, sortOrder: 1 },
  });
  revalidatePath("/settings/process-templates");
}
