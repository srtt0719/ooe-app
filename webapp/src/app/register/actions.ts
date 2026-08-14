"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseInputDate } from "@/lib/format";

export type FormState = { error: string };

export async function createSiteAndProduct(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const productName = String(formData.get("productName") ?? "").trim();
  if (!siteName) {
    return { error: "現場名を入力してください" };
  }
  if (!productName) {
    return { error: "製品名を入力してください" };
  }

  const managerUserIdRaw = String(formData.get("managerUserId") ?? "");
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const surfaceType = String(formData.get("surfaceType") ?? "自社");
  const isOutsourced = surfaceType === "外注";

  const product = await prisma.$transaction(async (tx) => {
    const site = await tx.site.create({
      data: {
        siteName,
        clientName: String(formData.get("clientName") ?? "").trim() || null,
        orderNumber: String(formData.get("orderNumber") ?? "").trim() || null,
        deliveryDueDate: parseInputDate(formData.get("deliveryDueDate")),
        managerUserId: managerUserIdRaw ? Number(managerUserIdRaw) : null,
      },
    });

    return tx.product.create({
      data: {
        siteId: site.siteId,
        productName,
        quantity: quantityRaw ? Number(quantityRaw) : null,
        material: String(formData.get("material") ?? "").trim() || null,
        thickness: String(formData.get("thickness") ?? "").trim() || null,
        finish: String(formData.get("finish") ?? "").trim() || null,
        drawingNumber: String(formData.get("drawingNumber") ?? "").trim() || null,
        processDueDate: parseInputDate(formData.get("processDueDate")),
        deliveryDate: parseInputDate(formData.get("deliveryDate")),
        materialStatus: String(formData.get("materialStatus") ?? "未発注"),
        materialArrivalDate: parseInputDate(formData.get("materialArrivalDate")),
        surfaceType,
        vendorName: isOutsourced ? String(formData.get("vendorName") ?? "").trim() || null : null,
        vendorSendDate: isOutsourced ? parseInputDate(formData.get("vendorSendDate")) : null,
        vendorReturnPlanned: isOutsourced
          ? parseInputDate(formData.get("vendorReturnPlanned"))
          : null,
      },
    });
  });

  redirect(`/products/${product.productId}`);
}
