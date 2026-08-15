"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function restoreSite(siteId: number) {
  await prisma.site.update({ where: { siteId }, data: { isDeleted: false } });
  revalidatePath("/settings/trash");
  revalidatePath("/sites");
  revalidatePath("/");
}

export async function restoreProduct(productId: number) {
  await prisma.product.update({ where: { productId }, data: { isDeleted: false } });
  revalidatePath("/settings/trash");
  revalidatePath("/products");
  revalidatePath("/finished");
  revalidatePath("/");
}
