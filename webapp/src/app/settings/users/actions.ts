"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateUser(userId: number, formData: FormData) {
  const userName = String(formData.get("userName") ?? "").trim();
  const lineworksId = String(formData.get("lineworksId") ?? "").trim() || null;
  const isActive = Boolean(formData.get("isActive"));
  if (!userName) return;
  await prisma.user.update({
    where: { userId },
    data: { userName, lineworksId, isActive },
  });
  revalidatePath("/settings/users");
  revalidatePath("/settings");
}

export async function addUser(formData: FormData) {
  const userName = String(formData.get("userName") ?? "").trim();
  if (!userName) return;
  await prisma.user.create({ data: { userName } });
  revalidatePath("/settings/users");
  revalidatePath("/settings");
}
