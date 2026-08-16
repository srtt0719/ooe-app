"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recomputeSiteStatus } from "@/lib/siteStatus";
import { getSettings, SETTING_KEYS, DEFAULT_CHECK_TEMPLATE } from "@/lib/settings";
import { sendToChannel, sendToUser } from "@/lib/lineworks";

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

async function notifyCheckComplete(
  productId: number,
  productName: string,
  siteName: string,
  managerLineworksId: string | null | undefined,
  resultText: string,
  checkerName: string,
) {
  const settings = await getSettings([
    SETTING_KEYS.notifyCheckGroup,
    SETTING_KEYS.notifyCheckFallbackUser,
    SETTING_KEYS.notifyCheckTemplate,
  ]);
  const message = renderTemplate(settings[SETTING_KEYS.notifyCheckTemplate] || DEFAULT_CHECK_TEMPLATE, {
    product: productName,
    site: siteName,
    result: resultText,
    checker: checkerName,
  });

  const channelId = settings[SETTING_KEYS.notifyCheckGroup];
  const targets: { label: string; recipient: string; run: () => Promise<{ ok: boolean; error?: string }> }[] = [];
  if (channelId) {
    targets.push({ label: "group", recipient: channelId, run: () => sendToChannel(channelId, message) });
  }

  if (managerLineworksId) {
    targets.push({
      label: "manager",
      recipient: managerLineworksId,
      run: () => sendToUser(managerLineworksId, message),
    });
  } else {
    const fallbackName = settings[SETTING_KEYS.notifyCheckFallbackUser];
    if (fallbackName) {
      const fallbackUser = await prisma.user.findFirst({ where: { userName: fallbackName, isActive: true } });
      if (fallbackUser?.lineworksId) {
        const fallbackId = fallbackUser.lineworksId;
        targets.push({ label: "fallback", recipient: fallbackId, run: () => sendToUser(fallbackId, message) });
      }
    }
  }

  for (const target of targets) {
    let status: string;
    try {
      const result = await target.run();
      status = result.ok ? "sent" : `error:${(result.error ?? "").slice(0, 200)}`;
    } catch (e) {
      status = `error:${e instanceof Error ? e.message.slice(0, 200) : "unknown"}`;
    }
    await prisma.notification.create({
      data: {
        productId,
        notifyType: "check_complete",
        target: `${target.label}:${target.recipient}`,
        message,
        status,
      },
    });
  }
}

export async function submitCheck(productId: number, formData: FormData) {
  const checkerName = String(formData.get("checkerName") ?? "").trim() || "不明";
  const itemsJson = String(formData.get("itemsJson") ?? "[]");
  const items: { id: number; name: string }[] = JSON.parse(itemsJson);
  // 同じチェック回であることが後から分かるよう、全行に同じ日時を持たせる。
  const checkedAt = new Date();

  const [product] = await prisma.$transaction([
    prisma.product.update({
      where: { productId },
      data: { status: "完了" },
      include: { site: { include: { manager: true } } },
    }),
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

  await recomputeSiteStatus(product.siteId);

  const okCount = items.filter((item) => formData.get(`checked_${item.id}`)).length;
  try {
    await notifyCheckComplete(
      productId,
      product.productName,
      product.site.siteName,
      product.site.manager?.lineworksId,
      `${okCount}/${items.length}`,
      checkerName,
    );
  } catch (e) {
    // 通知に失敗してもチェック記録の保存自体は完了させる(仕様書4-5)。
    console.error("check notification failed", e);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/sites/${product.siteId}`);
  revalidatePath("/products");
  revalidatePath("/sites");
  revalidatePath("/finished");
  revalidatePath("/");

  redirect(`/products/${productId}`);
}
