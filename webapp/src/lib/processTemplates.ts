import { prisma } from "./prisma";

// 仕様書2-5: テンプレートは製品ごとに「コピー」する(参照にしない)。
export async function getTemplateNames(): Promise<string[]> {
  const rows = await prisma.processTemplate.findMany({
    select: { templateName: true, templateId: true },
    orderBy: { templateId: "asc" },
  });
  const seen = new Set<string>();
  const names: string[] = [];
  for (const r of rows) {
    if (!seen.has(r.templateName)) {
      seen.add(r.templateName);
      names.push(r.templateName);
    }
  }
  return names;
}

export async function getTemplatesWithProcesses(): Promise<
  { templateName: string; processes: { processName: string; weight: number }[] }[]
> {
  const rows = await prisma.processTemplate.findMany({
    orderBy: [{ templateId: "asc" }, { sortOrder: "asc" }],
  });
  const byName = new Map<string, { processName: string; weight: number }[]>();
  const order: string[] = [];
  for (const r of rows) {
    if (!byName.has(r.templateName)) {
      byName.set(r.templateName, []);
      order.push(r.templateName);
    }
    byName.get(r.templateName)!.push({ processName: r.processName, weight: r.weight });
  }
  return order.map((templateName) => ({ templateName, processes: byName.get(templateName)! }));
}

export async function copyTemplateProcesses(templateName: string, productId: number) {
  const rows = await prisma.processTemplate.findMany({
    where: { templateName },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) return;
  await prisma.process.createMany({
    data: rows.map((r) => ({
      productId,
      processName: r.processName,
      weight: r.weight,
      sortOrder: r.sortOrder,
    })),
  });
}
