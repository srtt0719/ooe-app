"use server";

import { revalidatePath } from "next/cache";
import { setSetting, setSettingJsonArray, getSettings, SETTING_KEYS, DEFAULT_CHECK_TEMPLATE } from "@/lib/settings";
import { sendToChannel } from "@/lib/lineworks";

export async function saveCheckNotifySettings(formData: FormData) {
  await setSetting(SETTING_KEYS.notifyCheckGroup, String(formData.get("notifyCheckGroup") ?? "").trim());
  await setSetting(
    SETTING_KEYS.notifyCheckFallbackUser,
    String(formData.get("notifyCheckFallbackUser") ?? "").trim(),
  );
  await setSetting(
    SETTING_KEYS.notifyCheckTemplate,
    String(formData.get("notifyCheckTemplate") ?? "").trim() || DEFAULT_CHECK_TEMPLATE,
  );
  revalidatePath("/settings");
}

// 秘密情報は画面に値を送り返さない(伏字表示)ため、空欄で送信された項目は
// 「変更しない」とみなして現在値を維持する。
export async function saveLineWorksConnection(formData: FormData) {
  const fields: { key: string; name: string }[] = [
    { key: SETTING_KEYS.lineworksClientId, name: "clientId" },
    { key: SETTING_KEYS.lineworksClientSecret, name: "clientSecret" },
    { key: SETTING_KEYS.lineworksServiceAccount, name: "serviceAccount" },
    { key: SETTING_KEYS.lineworksPrivateKey, name: "privateKey" },
    { key: SETTING_KEYS.lineworksBotId, name: "botId" },
  ];
  for (const { key, name } of fields) {
    const value = String(formData.get(name) ?? "").trim();
    if (value) await setSetting(key, value);
  }
  revalidatePath("/settings");
}

type TestResult = { ok: boolean; error?: string };

export async function sendTestCheckNotification(): Promise<TestResult> {
  const s = await getSettings([SETTING_KEYS.notifyCheckGroup]);
  const channelId = s[SETTING_KEYS.notifyCheckGroup];
  if (!channelId) return { ok: false, error: "送信先グループ(チャンネルID)が未設定です" };
  return sendToChannel(channelId, "【テスト送信】完成チェック通知の設定確認です。");
}

export async function sendTestDailyNotification(): Promise<TestResult> {
  const s = await getSettings([SETTING_KEYS.notifyDailyGroup]);
  const channelId = s[SETTING_KEYS.notifyDailyGroup];
  if (!channelId) return { ok: false, error: "送信先グループ(チャンネルID)が未設定です" };
  return sendToChannel(channelId, "【テスト送信】朝のまとめ通知の設定確認です。");
}

export async function saveDailySettings(formData: FormData) {
  await setSetting(SETTING_KEYS.notifyDailyGroup, String(formData.get("notifyDailyGroup") ?? "").trim());
  await setSetting(SETTING_KEYS.notifyDailyTime, String(formData.get("notifyDailyTime") ?? "08:30").trim());
  await setSetting(
    SETTING_KEYS.notifyDaysBefore,
    String(Number(formData.get("notifyDaysBefore") ?? 3) || 3),
  );
  await setSetting(
    SETTING_KEYS.notifyDailyEnableProcessDue,
    formData.get("enableProcessDue") ? "true" : "false",
  );
  await setSetting(
    SETTING_KEYS.notifyDailyEnableDelivery,
    formData.get("enableDelivery") ? "true" : "false",
  );
  await setSetting(
    SETTING_KEYS.notifyDailyEnableVendorOverdue,
    formData.get("enableVendorOverdue") ? "true" : "false",
  );
  await setSetting(
    SETTING_KEYS.notifyDailyEnableMaterialArrival,
    formData.get("enableMaterialArrival") ? "true" : "false",
  );
  revalidatePath("/settings");
}

function parseLines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveOptionSettings(formData: FormData) {
  await setSettingJsonArray(SETTING_KEYS.materialOptions, parseLines(formData.get("materialOptions")));
  await setSettingJsonArray(SETTING_KEYS.finishOptions, parseLines(formData.get("finishOptions")));
  await setSettingJsonArray(SETTING_KEYS.vendorNames, parseLines(formData.get("vendorNames")));
  revalidatePath("/settings");
}
