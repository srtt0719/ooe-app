"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseInputDate } from "@/lib/format";
import { copyTemplateProcesses } from "@/lib/processTemplates";
import { recomputeSiteStatus } from "@/lib/siteStatus";

export type FormState = { error: string };

function readProductFields(formData: FormData) {
  const productName = String(formData.get("productName") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const surfaceType = String(formData.get("surfaceType") ?? "自社");
  const isOutsourced = surfaceType === "外注";

  return {
    productName,
    orderNumber: String(formData.get("orderNumber") ?? "").trim() || null,
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
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

export async function createProduct(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const siteId = Number(formData.get("siteId"));
  if (!Number.isFinite(siteId) || siteId <= 0) {
    return { error: "現場を選んでください" };
  }
  const fields = readProductFields(formData);
  if (!fields.productName) {
    return { error: "製品名を入力してください" };
  }

  const product = await prisma.product.create({ data: { ...fields, siteId } });

  const templateName = String(formData.get("templateName") ?? "").trim();
  if (templateName) {
    await copyTemplateProcesses(templateName, product.productId);
  }

  // 完了扱いだった現場に新しい製品を追加した場合は、作業再開として進行中に戻す
  await recomputeSiteStatus(siteId);

  redirect(`/products/${product.productId}`);
}

export async function updateProduct(
  productId: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields = readProductFields(formData);
  if (!fields.productName) {
    return { error: "製品名を入力してください" };
  }
  const status = String(formData.get("status") ?? "未着手");
  const vendorReturnActual = parseInputDate(formData.get("vendorReturnActual"));

  const product = await prisma.product.update({
    where: { productId },
    data: { ...fields, status, vendorReturnActual },
  });
  await recomputeSiteStatus(product.siteId);
  redirect(`/products/${productId}`);
}

export async function deleteProduct(productId: number) {
  const product = await prisma.product.update({
    where: { productId },
    data: { isDeleted: true },
  });
  await recomputeSiteStatus(product.siteId);
  redirect(`/sites/${product.siteId}`);
}
