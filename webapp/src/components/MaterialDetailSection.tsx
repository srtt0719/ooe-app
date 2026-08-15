import {
  addMaterialDetail,
  updateMaterialDetail,
  deleteMaterialDetail,
} from "@/app/products/materialDetailActions";

type Detail = {
  detailId: number;
  partName: string | null;
  materialGrade: string | null;
  sizeSpec: string | null;
  length: number | null | { toString(): string };
  unit: string | null;
  quantityEstimated: number | null | { toString(): string };
  quantityActual: number | null | { toString(): string };
  note: string | null;
};

export function MaterialDetailSection({
  productId,
  details,
}: {
  productId: number;
  details: Detail[];
}) {
  const boundAdd = addMaterialDetail.bind(null, productId);

  return (
    <>
      <div className="eyebrow">
        部材明細 <span className="count">{details.length}</span>
      </div>
      <div className="note" style={{ marginTop: 0 }}>
        見積時の数量と実際に使った数量を分けて記録しておくと、将来の見積精度の検証に使えます（任意項目です）。
      </div>

      {details.map((d) => {
        const boundUpdate = updateMaterialDetail.bind(null, d.detailId, productId);
        const boundDelete = deleteMaterialDetail.bind(null, d.detailId, productId);
        return (
          <form action={boundUpdate} key={d.detailId} className="card">
            <div className="fld2">
              <div className="fld">
                <label>部材名</label>
                <input className="inp" name="partName" defaultValue={d.partName ?? ""} required />
              </div>
              <div className="fld">
                <label>材質</label>
                <input className="inp" name="materialGrade" defaultValue={d.materialGrade ?? ""} />
              </div>
            </div>
            <div className="fld2">
              <div className="fld">
                <label>サイズ・板厚</label>
                <input className="inp" name="sizeSpec" defaultValue={d.sizeSpec ?? ""} />
              </div>
              <div className="fld">
                <label>長さ(mm)</label>
                <input className="inp" name="length" type="number" defaultValue={d.length?.toString() ?? ""} />
              </div>
            </div>
            <div className="fld2">
              <div className="fld">
                <label>見積数量</label>
                <input
                  className="inp"
                  name="quantityEstimated"
                  type="number"
                  step="any"
                  defaultValue={d.quantityEstimated?.toString() ?? ""}
                />
              </div>
              <div className="fld">
                <label>実績数量</label>
                <input
                  className="inp"
                  name="quantityActual"
                  type="number"
                  step="any"
                  defaultValue={d.quantityActual?.toString() ?? ""}
                />
              </div>
            </div>
            <div className="fld">
              <label>単位</label>
              <input className="inp" name="unit" defaultValue={d.unit ?? ""} placeholder="本・枚・m など" />
            </div>
            <div className="fld">
              <label>備考</label>
              <input className="inp" name="note" defaultValue={d.note ?? ""} />
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

      <form action={boundAdd} className="card">
        <div className="fld2">
          <div className="fld">
            <label>部材名</label>
            <input className="inp" name="partName" placeholder="例：ベースプレート" required />
          </div>
          <div className="fld">
            <label>材質</label>
            <input className="inp" name="materialGrade" placeholder="例：SS400" />
          </div>
        </div>
        <div className="fld2">
          <div className="fld">
            <label>サイズ・板厚</label>
            <input className="inp" name="sizeSpec" placeholder="例：t9" />
          </div>
          <div className="fld">
            <label>長さ(mm)</label>
            <input className="inp" name="length" type="number" />
          </div>
        </div>
        <div className="fld2">
          <div className="fld">
            <label>見積数量</label>
            <input className="inp" name="quantityEstimated" type="number" step="any" />
          </div>
          <div className="fld">
            <label>実績数量</label>
            <input className="inp" name="quantityActual" type="number" step="any" />
          </div>
        </div>
        <div className="fld">
          <label>単位</label>
          <input className="inp" name="unit" placeholder="本・枚・m など" />
        </div>
        <button className="btn wide" type="submit">
          部材を追加
        </button>
      </form>
    </>
  );
}
