"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateCheckItem(itemId: number, formData: FormData) {
  const itemName = String(formData.get("itemName") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = Boolean(formData.get("isActive"));
  if (!itemName) return;
  await prisma.checkItem.update({
    where: { itemId },
    data: { itemName, sortOrder, isActive },
  });
  revalidatePath("/settings/check-items");
}

export async function addCheckItem(formData: FormData) {
  const itemName = String(formData.get("itemName") ?? "").trim();
  if (!itemName) return;
  const max = await prisma.checkItem.aggregate({ _max: { sortOrder: true } });
  await prisma.checkItem.create({
    data: { itemName, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/settings/check-items");
}
