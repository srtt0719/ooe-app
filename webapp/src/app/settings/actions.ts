"use server";

import { revalidatePath } from "next/cache";
import { setSetting, setSettingJsonArray, SETTING_KEYS } from "@/lib/settings";

export async function saveCheckNotifySettings(formData: FormData) {
  await setSetting(SETTING_KEYS.notifyCheckGroup, String(formData.get("notifyCheckGroup") ?? "").trim());
  await setSetting(
    SETTING_KEYS.notifyCheckFallbackUser,
    String(formData.get("notifyCheckFallbackUser") ?? "").trim(),
  );
  revalidatePath("/settings");
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
