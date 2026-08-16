import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { getSettings, getSettingJsonArray, SETTING_KEYS, DEFAULT_CHECK_TEMPLATE } from "@/lib/settings";
import {
  saveCheckNotifySettings,
  saveDailySettings,
  saveOptionSettings,
  saveLineWorksConnection,
  sendTestCheckNotification,
  sendTestDailyNotification,
} from "./actions";
import { TestSendButton } from "./TestSendButton";

export default async function SettingsPage() {
  const [users, s, materialOptions, finishOptions, vendorNames] = await Promise.all([
    prisma.user.findMany({ orderBy: { userName: "asc" } }),
    getSettings([
      SETTING_KEYS.notifyCheckGroup,
      SETTING_KEYS.notifyCheckFallbackUser,
      SETTING_KEYS.notifyCheckTemplate,
      SETTING_KEYS.notifyDailyGroup,
      SETTING_KEYS.notifyDailyTime,
      SETTING_KEYS.notifyDaysBefore,
      SETTING_KEYS.notifyDailyEnableProcessDue,
      SETTING_KEYS.notifyDailyEnableDelivery,
      SETTING_KEYS.notifyDailyEnableVendorOverdue,
      SETTING_KEYS.notifyDailyEnableMaterialArrival,
      SETTING_KEYS.lineworksClientId,
      SETTING_KEYS.lineworksClientSecret,
      SETTING_KEYS.lineworksServiceAccount,
      SETTING_KEYS.lineworksPrivateKey,
      SETTING_KEYS.lineworksBotId,
    ]),
    getSettingJsonArray(SETTING_KEYS.materialOptions, []),
    getSettingJsonArray(SETTING_KEYS.finishOptions, []),
    getSettingJsonArray(SETTING_KEYS.vendorNames, []),
  ]);

  const lwConnected = Boolean(
    s[SETTING_KEYS.lineworksClientId] &&
      s[SETTING_KEYS.lineworksClientSecret] &&
      s[SETTING_KEYS.lineworksServiceAccount] &&
      s[SETTING_KEYS.lineworksPrivateKey] &&
      s[SETTING_KEYS.lineworksBotId],
  );

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
        <Link className="menu" href="/settings/trash">
          <div className="mno">🗑</div>
          <div className="mtxt">
            <b>削除済み</b>
            <span>誤って削除した現場・製品を元に戻す</span>
          </div>
        </Link>

        <div className="eyebrow">LINE WORKS 接続情報</div>
        <div className="note" style={{ marginTop: 0 }}>
          手順の目安：
          <br />
          1. LINE WORKS Developer Console でアプリを作成し、Bot機能を有効化（Bot IDを確認）
          <br />
          2. 同じアプリで Service Account を作成し、Client ID・Client Secret・Service
          Account・秘密鍵(PEMファイル)を取得
          <br />
          3. LINE WORKS管理者画面でこのBotに bot / bot.message の権限を許可
          <br />
          4. 下のフォームに接続情報を貼り付けて保存
          <br />
          設定済みの項目は空欄で表示されます（変更する場合のみ入力してください）。
        </div>
        <form action={saveLineWorksConnection} className="card">
          <div className="fld">
            <label htmlFor="lwClientId">Client ID</label>
            <input
              className="inp"
              id="lwClientId"
              name="clientId"
              placeholder={s[SETTING_KEYS.lineworksClientId] ? "設定済み（変更する場合のみ入力）" : "未設定"}
            />
          </div>
          <div className="fld">
            <label htmlFor="lwClientSecret">Client Secret</label>
            <input
              className="inp"
              id="lwClientSecret"
              name="clientSecret"
              type="password"
              placeholder={s[SETTING_KEYS.lineworksClientSecret] ? "設定済み（変更する場合のみ入力）" : "未設定"}
            />
          </div>
          <div className="fld">
            <label htmlFor="lwServiceAccount">Service Account</label>
            <input
              className="inp"
              id="lwServiceAccount"
              name="serviceAccount"
              placeholder={s[SETTING_KEYS.lineworksServiceAccount] ? "設定済み（変更する場合のみ入力）" : "未設定"}
            />
          </div>
          <div className="fld">
            <label htmlFor="lwPrivateKey">秘密鍵（PEM）</label>
            <textarea
              className="inp"
              id="lwPrivateKey"
              name="privateKey"
              rows={4}
              placeholder={
                s[SETTING_KEYS.lineworksPrivateKey]
                  ? "設定済み（変更する場合のみ貼り付け）"
                  : "-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----"
              }
            />
          </div>
          <div className="fld">
            <label htmlFor="lwBotId">Bot ID</label>
            <input
              className="inp"
              id="lwBotId"
              name="botId"
              placeholder={s[SETTING_KEYS.lineworksBotId] ? "設定済み（変更する場合のみ入力）" : "未設定"}
            />
          </div>
          <button className="btn wide" type="submit">
            保存
          </button>
          <div className="note" style={{ margin: "10px 0 0" }}>
            {lwConnected ? "接続情報：設定済み" : "接続情報：未設定（上の5項目すべてを保存すると通知が有効になります）"}
          </div>
        </form>

        <div className="eyebrow">完成チェック通知</div>
        <div className="note" style={{ marginTop: 0 }}>
          送信先グループは、LINE WORKSのグループトークルームを開き、メニューの「チャンネルID」からコピーして貼り付けてください。
        </div>
        <form action={saveCheckNotifySettings} className="card">
          <div className="fld">
            <label htmlFor="notifyCheckGroup">送信先グループ（チャンネルID）</label>
            <input
              className="inp"
              id="notifyCheckGroup"
              name="notifyCheckGroup"
              defaultValue={s[SETTING_KEYS.notifyCheckGroup]}
              placeholder="例：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
          <div className="fld">
            <label htmlFor="notifyCheckTemplate">
              送信文のテンプレート
              <em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
                {"{product} {site} {result} {checker} が使えます"}
              </em>
            </label>
            <textarea
              className="inp"
              id="notifyCheckTemplate"
              name="notifyCheckTemplate"
              rows={4}
              defaultValue={s[SETTING_KEYS.notifyCheckTemplate] || DEFAULT_CHECK_TEMPLATE}
            />
          </div>
          <button className="btn wide" type="submit">
            保存
          </button>
        </form>
        <TestSendButton action={sendTestCheckNotification} label="完成チェック通知をテスト送信" />

        <div className="eyebrow">朝のまとめ</div>
        <form action={saveDailySettings} className="card">
          <div className="fld">
            <label htmlFor="notifyDailyGroup">送信先グループ（チャンネルID）</label>
            <input
              className="inp"
              id="notifyDailyGroup"
              name="notifyDailyGroup"
              defaultValue={s[SETTING_KEYS.notifyDailyGroup]}
              placeholder="例：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
            毎朝の指定時刻での自動送信は別途対応します。ここで設定・テスト送信しておけば、自動送信を有効にした際すぐ動きます。
          </div>
        </form>
        <TestSendButton action={sendTestDailyNotification} label="朝のまとめ通知をテスト送信" />

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
