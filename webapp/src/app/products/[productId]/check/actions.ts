"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function submitCheck(productId: number, formData: FormData) {
  const checkerName = String(formData.get("checkerName") ?? "").trim() || "不明";
  const itemsJson = String(formData.get("itemsJson") ?? "[]");
  const items: { id: number; name: string }[] = JSON.parse(itemsJson);
  // 同じチェック回であることが後から分かるよう、全行に同じ日時を持たせる。
  const checkedAt = new Date();

  const [product] = await prisma.$transaction([
    prisma.product.update({ where: { productId }, data: { status: "完了" } }),
    ...items.map((item) =>
      prisma.checkRecord.create({
        data: {
          productId,
          itemName: item.name,
          result: formData.get(`checked_${item.id}`) ? "OK" : "未確認",
          checkerName,
          checkedAt,
        },
      }),
    ),
  ]);

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/sites/${product.siteId}`);
  revalidatePath("/products");
  revalidatePath("/sites");
  revalidatePath("/finished");
  revalidatePath("/");

  redirect(`/products/${productId}`);
}
