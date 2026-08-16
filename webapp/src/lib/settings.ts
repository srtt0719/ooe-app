import { prisma } from "./prisma";

// 通知先・時刻・判定日数・プルダウン候補などは settings テーブルに保持し、
// コードに直書きしない(仕様書3-11・4-5)。

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const k of keys) map[k] = "";
  for (const row of rows) map[row.key] = row.value ?? "";
  return map;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getSettingJsonArray(key: string, fallback: string[]): Promise<string[]> {
  const raw = await getSetting(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : fallback;
  } catch {
    return fallback;
  }
}

export async function setSettingJsonArray(key: string, values: string[]): Promise<void> {
  await setSetting(key, JSON.stringify(values));
}

export const SETTING_KEYS = {
  notifyCheckGroup: "notify_check_group",
  notifyCheckFallbackUser: "notify_check_fallback_user",
  notifyCheckTemplate: "notify_check_template",
  notifyDailyGroup: "notify_daily_group",
  notifyDailyTime: "notify_daily_time",
  notifyDaysBefore: "notify_days_before",
  notifyDailyEnableProcessDue: "notify_daily_enable_process_due",
  notifyDailyEnableDelivery: "notify_daily_enable_delivery",
  notifyDailyEnableVendorOverdue: "notify_daily_enable_vendor_overdue",
  notifyDailyEnableMaterialArrival: "notify_daily_enable_material_arrival",
  materialOptions: "material_options",
  finishOptions: "finish_options",
  vendorNames: "vendor_names",
  lineworksClientId: "lineworks_client_id",
  lineworksClientSecret: "lineworks_client_secret",
  lineworksServiceAccount: "lineworks_service_account",
  lineworksPrivateKey: "lineworks_private_key",
  lineworksBotId: "lineworks_bot_id",
} as const;

export const DEFAULT_CHECK_TEMPLATE =
  "【完成チェック】{product}（{site}）\nチェック結果：{result}\nチェック者：{checker}";

export const DEFAULT_MATERIAL_OPTIONS = ["SS400", "SUS304", "SPCC", "アルミ", "その他"];
export const DEFAULT_FINISH_OPTIONS = [
  "溶融亜鉛めっき",
  "焼付塗装",
  "生地",
  "研磨（ヘアライン）",
  "その他",
];
