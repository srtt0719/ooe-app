"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseInputDate } from "@/lib/format";

export type FormState = { error: string };

function readSiteFields(formData: FormData) {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const managerUserIdRaw = String(formData.get("managerUserId") ?? "");
  return {
    siteName,
    clientName: String(formData.get("clientName") ?? "").trim() || null,
    orderNumber: String(formData.get("orderNumber") ?? "").trim() || null,
    deliveryDueDate: parseInputDate(formData.get("deliveryDueDate")),
    managerUserId: managerUserIdRaw ? Number(managerUserIdRaw) : null,
    siteAddress: String(formData.get("siteAddress") ?? "").trim() || null,
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

export async function updateSite(
  siteId: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields = readSiteFields(formData);
  if (!fields.siteName) {
    return { error: "現場名を入力してください" };
  }
  const status = String(formData.get("status") ?? "進行中");

  await prisma.site.update({
    where: { siteId },
    data: { ...fields, status },
  });
  redirect(`/sites/${siteId}`);
}

export async function deleteSite(siteId: number) {
  // 現場を削除すると、確認画面で示した通りその現場の製品も一覧から見えなくする。
  await prisma.$transaction([
    prisma.product.updateMany({
      where: { siteId },
      data: { isDeleted: true },
    }),
    prisma.site.update({
      where: { siteId },
      data: { isDeleted: true },
    }),
  ]);
  redirect("/sites");
}
