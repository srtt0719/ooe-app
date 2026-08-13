// 仕様書 3-3・3-5 の初期データを投入する。
// 何度実行しても重複登録されないよう、既存件数を確認してから投入する。
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const templateCount = await prisma.processTemplate.count();
  if (templateCount === 0) {
    await prisma.processTemplate.createMany({
      data: [
        { templateName: "標準", processName: "切断", weight: 15, sortOrder: 1 },
        { templateName: "標準", processName: "カエリ取り", weight: 8, sortOrder: 2 },
        { templateName: "標準", processName: "穴あけ", weight: 15, sortOrder: 3 },
        { templateName: "標準", processName: "組立", weight: 18, sortOrder: 4 },
        { templateName: "標準", processName: "溶接", weight: 22, sortOrder: 5 },
        { templateName: "標準", processName: "仕上げ", weight: 12, sortOrder: 6 },
        { templateName: "標準", processName: "塗装・研磨", weight: 10, sortOrder: 7 },
      ],
    });
    console.log("process_templates: 初期データを投入しました");
  } else {
    console.log("process_templates: 既にデータがあるためスキップ");
  }

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
