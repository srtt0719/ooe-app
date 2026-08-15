import { prisma } from "./prisma";

// 現場に属する全製品が作業終了(完了/出荷済)になったら現場も「完了」にし、
// 新しい製品が追加されるなど作業が再開したら「進行中」に戻す。
export async function recomputeSiteStatus(siteId: number) {
  const site = await prisma.site.findUnique({
    where: { siteId },
    select: { status: true },
  });
  if (!site || (site.status !== "進行中" && site.status !== "完了")) {
    // 「保留」は手動管理の状態なので自動では触らない
    return;
  }

  const [activeCount, totalCount] = await Promise.all([
    prisma.product.count({
      where: { siteId, isDeleted: false, status: { notIn: ["完了", "出荷済"] } },
    }),
    prisma.product.count({ where: { siteId, isDeleted: false } }),
  ]);

  const shouldBeComplete = totalCount > 0 && activeCount === 0;

  if (shouldBeComplete && site.status !== "完了") {
    await prisma.site.update({ where: { siteId }, data: { status: "完了" } });
  } else if (!shouldBeComplete && site.status === "完了") {
    await prisma.site.update({ where: { siteId }, data: { status: "進行中" } });
  }
}
