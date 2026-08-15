import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { updateCheckItem, addCheckItem } from "./actions";

export default async function CheckItemsPage() {
  const items = await prisma.checkItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <AppHeader title="チェック項目" subtitle="設定" backHref="/settings" />
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          完成チェック画面に表示される項目です。無効化した項目は表示されなくなりますが、過去のチェック記録は残ります。
        </div>

        <div className="card">
          {items.map((item) => {
            const bound = updateCheckItem.bind(null, item.itemId);
            return (
              <form
                action={bound}
                key={item.itemId}
                style={{ borderBottom: "1px solid var(--hair)", padding: "12px 0" }}
              >
                <div className="fld2">
                  <div className="fld">
                    <label>項目</label>
                    <input className="inp" name="itemName" defaultValue={item.itemName} required />
                  </div>
                  <div className="fld">
                    <label>並び順</label>
                    <input className="inp" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5 }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={item.isActive}
                      style={{ width: 17, height: 17 }}
                    />
                    使用中
                  </label>
                  <button className="btn ghost" type="submit" style={{ flex: 1 }}>
                    保存
                  </button>
                </div>
              </form>
            );
          })}

          <form action={addCheckItem} style={{ paddingTop: 12 }}>
            <div className="fld">
              <label>新しい項目</label>
              <input className="inp" name="itemName" placeholder="例：塗装のムラはないか" required />
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
