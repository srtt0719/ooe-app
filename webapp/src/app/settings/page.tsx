import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { getSettings, getSettingJsonArray, SETTING_KEYS } from "@/lib/settings";
import { saveCheckNotifySettings, saveDailySettings, saveOptionSettings } from "./actions";

export default async function SettingsPage() {
  const [users, s, materialOptions, finishOptions, vendorNames] = await Promise.all([
    prisma.user.findMany({ orderBy: { userName: "asc" } }),
    getSettings([
      SETTING_KEYS.notifyCheckGroup,
      SETTING_KEYS.notifyCheckFallbackUser,
      SETTING_KEYS.notifyDailyGroup,
      SETTING_KEYS.notifyDailyTime,
      SETTING_KEYS.notifyDaysBefore,
      SETTING_KEYS.notifyDailyEnableProcessDue,
      SETTING_KEYS.notifyDailyEnableDelivery,
      SETTING_KEYS.notifyDailyEnableVendorOverdue,
      SETTING_KEYS.notifyDailyEnableMaterialArrival,
    ]),
    getSettingJsonArray(SETTING_KEYS.materialOptions, []),
    getSettingJsonArray(SETTING_KEYS.finishOptions, []),
    getSettingJsonArray(SETTING_KEYS.vendorNames, []),
  ]);

  const activeUsers = users.filter((u) => u.isActive);
  const missingIdCount = activeUsers.filter((u) => !u.lineworksId).length;

  return (
    <div>
      <AppHeader title="設定" subtitle="通知・マスタ編集" />
      <div className="wrap">
        <div className="eyebrow">マスタ編集</div>
        <Link className="menu" href="/settings/process-templates">
          <div className="mno">工程</div>
          <div className="mtxt">
            <b>工程テンプレート</b>
            <span>工程名・重み・並び順・着手時の注意文</span>
          </div>
        </Link>
        <Link className="menu" href="/settings/check-items">
          <div className="mno">確認</div>
          <div className="mtxt">
            <b>チェック項目</b>
            <span>完成チェックの項目を追加・編集</span>
          </div>
        </Link>
        <Link className="menu" href="/settings/users">
          <div className="mno">👤</div>
          <div className="mtxt">
            <b>ユーザー</b>
            <span>従業員の追加・無効化・LINE WORKS ID</span>
          </div>
          {missingIdCount > 0 && <div className="mbadge">{missingIdCount}</div>}
        </Link>

        <div className="eyebrow">LINE WORKS 通知先</div>
        <div className="note" style={{ marginTop: 0 }}>
          手順の目安: LINE WORKS管理画面でボットを作成 → トークンを環境変数に設定 →
          対象グループにボットを追加 → ここでグループ名を設定。
          <br />
          <b>ボット本体の接続（トークン）はフェーズ5で対応します。</b>
          それまでは送信先を設定しても実際の送信は行われず、チェック記録・工程管理などは通常どおり動作します。
        </div>
        <form action={saveCheckNotifySettings} className="card">
          <div className="fld">
            <label htmlFor="notifyCheckGroup">完成チェック通知：送信先グループ</label>
            <input
              className="inp"
              id="notifyCheckGroup"
              name="notifyCheckGroup"
              defaultValue={s[SETTING_KEYS.notifyCheckGroup]}
              placeholder="例：Aグループ"
            />
          </div>
          <div className="fld">
            <label htmlFor="notifyCheckFallbackUser">担当者未設定時の代替宛先</label>
            <select
              className="inp"
              id="notifyCheckFallbackUser"
              name="notifyCheckFallbackUser"
              defaultValue={s[SETTING_KEYS.notifyCheckFallbackUser]}
            >
              <option value="">未設定</option>
              {activeUsers.map((u) => (
                <option key={u.userId} value={u.userName}>
                  {u.userName}
                  {!u.lineworksId && "（ID未登録）"}
                </option>
              ))}
            </select>
          </div>
          <button className="btn wide" type="submit">
            保存
          </button>
        </form>

        <div className="eyebrow">朝のまとめ</div>
        <form action={saveDailySettings} className="card">
          <div className="fld">
            <label htmlFor="notifyDailyGroup">送信先グループ</label>
            <input
              className="inp"
              id="notifyDailyGroup"
              name="notifyDailyGroup"
              defaultValue={s[SETTING_KEYS.notifyDailyGroup]}
              placeholder="例：Aグループ"
            />
          </div>
          <div className="fld2">
            <div className="fld">
              <label htmlFor="notifyDailyTime">送信時刻</label>
              <input
                className="inp"
                id="notifyDailyTime"
                name="notifyDailyTime"
                type="time"
                defaultValue={s[SETTING_KEYS.notifyDailyTime] || "08:30"}
              />
            </div>
            <div className="fld">
              <label htmlFor="notifyDaysBefore">「納期が近い」判定日数</label>
              <input
                className="inp"
                id="notifyDaysBefore"
                name="notifyDaysBefore"
                type="number"
                min={1}
                defaultValue={s[SETTING_KEYS.notifyDaysBefore] || "3"}
              />
            </div>
          </div>
          <div className="fld">
            <label>含める区分</label>
            <CheckboxRow
              name="enableProcessDue"
              label="加工納期が近い"
              defaultChecked={s[SETTING_KEYS.notifyDailyEnableProcessDue] !== "false"}
            />
            <CheckboxRow
              name="enableDelivery"
              label="現場搬入が近い"
              defaultChecked={s[SETTING_KEYS.notifyDailyEnableDelivery] !== "false"}
            />
            <CheckboxRow
              name="enableVendorOverdue"
              label="外注 戻り遅れ"
              defaultChecked={s[SETTING_KEYS.notifyDailyEnableVendorOverdue] !== "false"}
            />
            <CheckboxRow
              name="enableMaterialArrival"
              label="材料 未入荷"
              defaultChecked={s[SETTING_KEYS.notifyDailyEnableMaterialArrival] !== "false"}
            />
          </div>
          <button className="btn wide" type="submit">
            保存
          </button>
          <div className="note" style={{ margin: "10px 0 0" }}>
            毎朝の自動送信自体はフェーズ5で実装します。ここでの設定は先に決めておけます。
          </div>
        </form>

        <div className="eyebrow">素材・仕上げ・外注先の候補</div>
        <form action={saveOptionSettings} className="card">
          <div className="fld">
            <label htmlFor="materialOptions">
              素材の選択肢<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
                1行に1つ
              </em>
            </label>
            <textarea
              className="inp"
              id="materialOptions"
              name="materialOptions"
              rows={5}
              defaultValue={materialOptions.join("\n")}
            />
          </div>
          <div className="fld">
            <label htmlFor="finishOptions">
              仕上げの選択肢<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
                1行に1つ
              </em>
            </label>
            <textarea
              className="inp"
              id="finishOptions"
              name="finishOptions"
              rows={5}
              defaultValue={finishOptions.join("\n")}
            />
          </div>
          <div className="fld">
            <label htmlFor="vendorNames">
              外注先の候補<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
                1行に1つ・任意
              </em>
            </label>
            <textarea
              className="inp"
              id="vendorNames"
              name="vendorNames"
              rows={3}
              defaultValue={vendorNames.join("\n")}
            />
          </div>
          <button className="btn wide" type="submit">
            保存
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckboxRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", fontSize: 14 }}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} style={{ width: 17, height: 17 }} />
      {label}
    </label>
  );
}
