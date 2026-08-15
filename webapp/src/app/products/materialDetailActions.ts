"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function addMaterialDetail(productId: number, formData: FormData) {
  const partName = String(formData.get("partName") ?? "").trim();
  if (!partName) return;
  await prisma.materialDetail.create({
    data: {
      productId,
      partName,
      materialGrade: String(formData.get("materialGrade") ?? "").trim() || null,
      sizeSpec: String(formData.get("sizeSpec") ?? "").trim() || null,
      length: numOrNull(formData.get("length")),
      unit: String(formData.get("unit") ?? "").trim() || null,
      quantityEstimated: numOrNull(formData.get("quantityEstimated")),
      quantityActual: numOrNull(formData.get("quantityActual")),
      source: "手入力",
      note: String(formData.get("note") ?? "").trim() || null,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function updateMaterialDetail(detailId: number, productId: number, formData: FormData) {
  const partName = String(formData.get("partName") ?? "").trim();
  if (!partName) return;
  await prisma.materialDetail.update({
    where: { detailId },
    data: {
      partName,
      materialGrade: String(formData.get("materialGrade") ?? "").trim() || null,
      sizeSpec: String(formData.get("sizeSpec") ?? "").trim() || null,
      length: numOrNull(formData.get("length")),
      unit: String(formData.get("unit") ?? "").trim() || null,
      quantityEstimated: numOrNull(formData.get("quantityEstimated")),
      quantityActual: numOrNull(formData.get("quantityActual")),
      note: String(formData.get("note") ?? "").trim() || null,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function deleteMaterialDetail(detailId: number, productId: number) {
  await prisma.materialDetail.delete({ where: { detailId } });
  revalidatePath(`/products/${productId}`);
}
