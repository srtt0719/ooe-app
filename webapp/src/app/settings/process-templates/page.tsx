import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { updateTemplateRow, deleteTemplateRow, addTemplateRow, createTemplate } from "./actions";

export default async function ProcessTemplatesPage() {
  const rows = await prisma.processTemplate.findMany({
    orderBy: [{ templateId: "asc" }, { sortOrder: "asc" }],
  });

  const byTemplate = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!byTemplate.has(r.templateName)) byTemplate.set(r.templateName, []);
    byTemplate.get(r.templateName)!.push(r);
  }

  return (
    <div>
      <AppHeader title="工程テンプレート" subtitle="設定" backHref="/settings" />
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          製品登録時に選ぶテンプレートです。ここでの変更は、以後の新規登録にのみ反映されます
          （すでに登録済みの製品の工程はコピー済みのため変わりません）。重みの合計は100が目安ですが、100でなくても保存できます。
        </div>

        {[...byTemplate.entries()].map(([templateName, templateRows]) => {
          const total = templateRows.reduce((s, r) => s + r.weight, 0);
          return (
            <div key={templateName} style={{ marginBottom: 26 }}>
              <div className="eyebrow">
                {templateName}{" "}
                <span className={`count${total !== 100 ? " warn" : ""}`}>合計 {total}</span>
              </div>
              <div className="card">
                {templateRows.map((row) => {
                  const bound = updateTemplateRow.bind(null, row.templateId);
                  const boundDelete = deleteTemplateRow.bind(null, row.templateId);
                  return (
                    <form
                      action={bound}
                      key={row.templateId}
                      style={{ borderBottom: "1px solid var(--hair)", padding: "12px 0" }}
                    >
                      <div className="fld2">
                        <div className="fld">
                          <label>工程名</label>
                          <input className="inp" name="processName" defaultValue={row.processName} required />
                        </div>
                        <div className="fld">
                          <label>重み</label>
                          <input
                            className="inp"
                            name="weight"
                            type="number"
                            min={0}
                            defaultValue={row.weight}
                          />
                        </div>
                      </div>
                      <div className="fld2">
                        <div className="fld">
                          <label>並び順</label>
                          <input
                            className="inp"
                            name="sortOrder"
                            type="number"
                            defaultValue={row.sortOrder}
                          />
                        </div>
                        <div className="fld">
                          <label>着手時の注意文</label>
                          <input
                            className="inp"
                            name="alertMessage"
                            defaultValue={row.alertMessage ?? ""}
                            placeholder="任意"
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button className="btn ghost" type="submit" style={{ flex: 1 }}>
                          保存
                        </button>
                        <button
                          className="btn ghost"
                          type="submit"
                          formAction={boundDelete}
                          style={{ color: "var(--primer)" }}
                        >
                          削除
                        </button>
                      </div>
                    </form>
                  );
                })}

                <form action={addTemplateRow.bind(null, templateName)} style={{ paddingTop: 12 }}>
                  <div className="fld2">
                    <div className="fld">
                      <label>工程名を追加</label>
                      <input className="inp" name="processName" placeholder="例：検査" required />
                    </div>
                    <div className="fld">
                      <label>重み</label>
                      <input className="inp" name="weight" type="number" min={0} defaultValue={10} />
                    </div>
                  </div>
                  <button className="btn wide" type="submit">
                    工程を追加
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        <div className="eyebrow">新しいテンプレート</div>
        <form action={createTemplate} className="card">
          <div className="fld">
            <label>テンプレート名</label>
            <input className="inp" name="templateName" placeholder="例：架台" required />
          </div>
          <div className="fld2">
            <div className="fld">
              <label>最初の工程名</label>
              <input className="inp" name="processName" placeholder="例：切断" required />
            </div>
            <div className="fld">
              <label>重み</label>
              <input className="inp" name="weight" type="number" min={0} defaultValue={100} />
            </div>
          </div>
          <button className="btn wide" type="submit">
            テンプレートを作成
          </button>
        </form>
      </div>
    </div>
  );
}
