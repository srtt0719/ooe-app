import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { updateUser, addUser } from "./actions";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { userName: "asc" }] });

  return (
    <div>
      <AppHeader title="ユーザー" subtitle="設定" backHref="/settings" />
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          LINE WORKS 個人IDは空のままでも運用できます。ID未登録のユーザーには目印を表示します。
          IDが未登録の担当者は、完成チェック通知が代替宛先（設定トップの「担当者未設定時の代替宛先」）にも送られます。
        </div>

        <div className="card">
          {users.map((user) => {
            const bound = updateUser.bind(null, user.userId);
            return (
              <form
                action={bound}
                key={user.userId}
                style={{ borderBottom: "1px solid var(--hair)", padding: "12px 0" }}
              >
                <div className="fld">
                  <label>
                    名前
                    {!user.lineworksId && (
                      <em style={{ fontStyle: "normal", fontWeight: 600, color: "var(--primer)", marginLeft: 7 }}>
                        （ID未登録）
                      </em>
                    )}
                  </label>
                  <input className="inp" name="userName" defaultValue={user.userName} required />
                </div>
                <div className="fld">
                  <label>LINE WORKS 個人ID</label>
                  <input
                    className="inp"
                    name="lineworksId"
                    defaultValue={user.lineworksId ?? ""}
                    placeholder="未登録"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5 }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={user.isActive}
                      style={{ width: 17, height: 17 }}
                    />
                    有効（退職者は外す）
                  </label>
                  <button className="btn ghost" type="submit" style={{ flex: 1 }}>
                    保存
                  </button>
                </div>
              </form>
            );
          })}

          <form action={addUser} style={{ paddingTop: 12 }}>
            <div className="fld">
              <label>新しいユーザーの名前</label>
              <input className="inp" name="userName" placeholder="例：佐藤" required />
            </div>
            <button className="btn wide" type="submit">
              追加
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
