// 仕様書 3-3・3-5 の初期データを投入する。
// 何度実行しても重複登録されないよう、既存件数を確認してから投入する。
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // createMany ではなく1行ずつ upsert 的に処理し、後から alert_message 等を
  // 追加しても既存データに反映できるようにする(仕様書5-4の注意喚起文)。
  const templates: {
    templateName: string;
    processName: string;
    weight: number;
    sortOrder: number;
    alertMessage: string | null;
  }[] = [
    { templateName: "標準", processName: "切断", weight: 15, sortOrder: 1, alertMessage: "材料・板厚は図面通りですか" },
    { templateName: "標準", processName: "カエリ取り", weight: 8, sortOrder: 2, alertMessage: null },
    { templateName: "標準", processName: "穴あけ", weight: 15, sortOrder: 3, alertMessage: "図面を確認しましたか" },
    { templateName: "標準", processName: "組立", weight: 18, sortOrder: 4, alertMessage: null },
    { templateName: "標準", processName: "溶接", weight: 22, sortOrder: 5, alertMessage: null },
    { templateName: "標準", processName: "仕上げ", weight: 12, sortOrder: 6, alertMessage: null },
    { templateName: "標準", processName: "塗装・研磨", weight: 10, sortOrder: 7, alertMessage: "仕上げ指示を確認しましたか" },
  ];
  for (const t of templates) {
    const existing = await prisma.processTemplate.findFirst({
      where: { templateName: t.templateName, processName: t.processName },
    });
    if (existing) {
      await prisma.processTemplate.update({
        where: { templateId: existing.templateId },
        data: {
          weight: t.weight,
          sortOrder: t.sortOrder,
          alertMessage: t.alertMessage,
        },
      });
    } else {
      await prisma.processTemplate.create({ data: t });
    }
  }
  console.log("process_templates: 初期データを確認しました");

  const checkItemCount = await prisma.checkItem.count();
  if (checkItemCount === 0) {
    await prisma.checkItem.createMany({
      data: [
        { itemName: "材料・板厚は図面通りか", sortOrder: 1 },
        { itemName: "寸法違いはないか", sortOrder: 2 },
        { itemName: "穴の開け忘れ・位置違いはないか", sortOrder: 3 },
        { itemName: "仕上げ忘れ・仕上げ違いはないか", sortOrder: 4 },
        { itemName: "傷・打痕はないか", sortOrder: 5 },
        { itemName: "溶接不良はないか", sortOrder: 6 },
        { itemName: "数量は揃っているか", sortOrder: 7 },
      ],
    });
    console.log("check_items: 初期データを投入しました");
  } else {
    console.log("check_items: 既にデータがあるためスキップ");
  }

  const settingDefaults: Record<string, string> = {
    notify_check_group: "",
    notify_check_fallback_user: "",
    notify_daily_group: "",
    notify_daily_time: "08:30",
    notify_days_before: "3",
    notify_daily_enable_process_due: "true",
    notify_daily_enable_delivery: "true",
    notify_daily_enable_vendor_overdue: "true",
    notify_daily_enable_material_arrival: "true",
    material_options: JSON.stringify(["SS400", "SUS304", "SPCC", "アルミ", "その他"]),
    finish_options: JSON.stringify(["溶融亜鉛めっき", "焼付塗装", "生地", "研磨（ヘアライン）", "その他"]),
    vendor_names: JSON.stringify([]),
  };
  for (const [key, value] of Object.entries(settingDefaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("settings: 初期値を確認しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
