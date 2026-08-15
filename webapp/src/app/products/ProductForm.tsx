"use client";

import { useActionState, useState } from "react";
import { MATERIAL_STATUS, SURFACE_TYPE } from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { RadioSeg3 } from "@/components/RadioSeg3";
import type { FormState } from "./actions";

type ProductInitial = {
  productName: string;
  orderNumber: string;
  quantity: string;
  material: string;
  thickness: string;
  finish: string;
  drawingNumber: string;
  processDueDate: Date | null;
  deliveryDate: Date | null;
  materialStatus: string;
  materialArrivalDate: Date | null;
  surfaceType: string;
  vendorName: string;
  vendorSendDate: Date | null;
  vendorReturnPlanned: Date | null;
  vendorReturnActual: Date | null;
  status: string;
  note: string;
};

const empty: ProductInitial = {
  productName: "",
  orderNumber: "",
  quantity: "",
  material: "",
  thickness: "",
  finish: "",
  drawingNumber: "",
  processDueDate: null,
  deliveryDate: null,
  materialStatus: "未発注",
  materialArrivalDate: null,
  surfaceType: "自社",
  vendorName: "",
  vendorSendDate: null,
  vendorReturnPlanned: null,
  vendorReturnActual: null,
  status: "未着手",
  note: "",
};

type TemplateWithProcesses = {
  templateName: string;
  processes: { processName: string; weight: number }[];
};

export function ProductForm({
  action,
  siteContext,
  sitesForPicker,
  templates,
  materialOptions,
  finishOptions,
  vendorNames,
  initial,
  submitLabel,
  showStatusAndActualReturn,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  siteContext?: { siteId: number; siteName: string; orderNumber: string | null };
  sitesForPicker?: { siteId: number; siteName: string }[];
  templates?: TemplateWithProcesses[];
  materialOptions: string[];
  finishOptions: string[];
  vendorNames: string[];
  initial?: Partial<ProductInitial>;
  submitLabel: string;
  showStatusAndActualReturn?: boolean;
}) {
  const v = { ...empty, ...initial };
  const [state, formAction, pending] = useActionState(action, { error: "" });
  const [surfaceType, setSurfaceType] = useState(v.surfaceType);
  const [templateName, setTemplateName] = useState(templates?.[0]?.templateName ?? "");
  const selectedTemplate = templates?.find((t) => t.templateName === templateName);

  return (
    <form action={formAction}>
      {siteContext ? (
        <div className="card" style={{ background: "#F7F7F4" }}>
          <div className="sub" style={{ margin: 0 }}>
            現場
          </div>
          <div className="name" style={{ fontSize: 14.5 }}>
            {siteContext.siteName}
            {siteContext.orderNumber && (
              <>
                {" ／ "}
                <span className="num">{siteContext.orderNumber}</span>
              </>
            )}
          </div>
          <input type="hidden" name="siteId" value={siteContext.siteId} />
        </div>
      ) : (
        sitesForPicker && (
          <div className="card">
            <div className="fld">
              <label htmlFor="siteId">現場</label>
              <select className="inp" id="siteId" name="siteId" required defaultValue="">
                <option value="" disabled>
                  選択してください
                </option>
                {sitesForPicker.map((s) => (
                  <option key={s.siteId} value={s.siteId}>
                    {s.siteName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      )}

      <div className="eyebrow">製品</div>
      <div className="card">
        <div className="fld">
          <label htmlFor="productName">製品名</label>
          <input
            className="inp"
            id="productName"
            name="productName"
            defaultValue={v.productName}
            placeholder="架台A"
            required
          />
        </div>
        <div className="fld2">
          <div className="fld">
            <label htmlFor="quantity">数量</label>
            <input className="inp" id="quantity" name="quantity" defaultValue={v.quantity} placeholder="10" />
          </div>
          <div className="fld">
            <label htmlFor="drawingNumber">図番</label>
            <input
              className="inp num"
              id="drawingNumber"
              name="drawingNumber"
              defaultValue={v.drawingNumber}
              placeholder="A-123"
            />
          </div>
        </div>
        <div className="fld2">
          <div className="fld">
            <label htmlFor="material">素材</label>
            <select className="inp" id="material" name="material" defaultValue={v.material || materialOptions[0]}>
              {materialOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="fld">
            <label htmlFor="thickness">板厚</label>
            <input
              className="inp num"
              id="thickness"
              name="thickness"
              defaultValue={v.thickness}
              placeholder="t9"
            />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="finish">仕上げ</label>
          <select className="inp" id="finish" name="finish" defaultValue={v.finish || finishOptions[0]}>
            {finishOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="orderNumber">
            発注番号<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              通常は空でよい
            </em>
          </label>
          <input className="inp" id="orderNumber" name="orderNumber" defaultValue={v.orderNumber} />
        </div>
      </div>

      <div className="eyebrow">納期</div>
      <div className="card">
        <div className="fld">
          <label htmlFor="processDueDate">
            加工納期予定日<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              自社の製作が終わる日
            </em>
          </label>
          <input
            className="inp"
            id="processDueDate"
            name="processDueDate"
            type="date"
            defaultValue={toInputDate(v.processDueDate)}
          />
        </div>
        <div className="fld">
          <label htmlFor="deliveryDate">
            現場搬入予定日<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              現場へ持っていく日
            </em>
          </label>
          <input
            className="inp"
            id="deliveryDate"
            name="deliveryDate"
            type="date"
            defaultValue={toInputDate(v.deliveryDate)}
          />
        </div>
      </div>

      <div className="eyebrow">材料</div>
      <div className="card">
        <div className="fld">
          <label>材料の状態</label>
          <RadioSeg3 name="materialStatus" options={MATERIAL_STATUS} defaultValue={v.materialStatus} />
        </div>
        <div className="fld">
          <label htmlFor="materialArrivalDate">入荷予定日</label>
          <input
            className="inp"
            id="materialArrivalDate"
            name="materialArrivalDate"
            type="date"
            defaultValue={toInputDate(v.materialArrivalDate)}
          />
        </div>
      </div>

      <div className="eyebrow">表面処理</div>
      <div className="card">
        <div className="fld">
          <label>区分</label>
          <RadioSeg3
            name="surfaceType"
            options={SURFACE_TYPE}
            defaultValue={surfaceType}
            onChangeValue={setSurfaceType}
          />
        </div>
        {surfaceType === "外注" && (
          <>
            <div className="fld">
              <label htmlFor="vendorName">外注先</label>
              <input
                className="inp"
                id="vendorName"
                name="vendorName"
                list="vendor-name-options"
                defaultValue={v.vendorName}
                placeholder="○○メッキ工業"
              />
              <datalist id="vendor-name-options">
                {vendorNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="fld2">
              <div className="fld">
                <label htmlFor="vendorSendDate">持込予定日</label>
                <input
                  className="inp"
                  id="vendorSendDate"
                  name="vendorSendDate"
                  type="date"
                  defaultValue={toInputDate(v.vendorSendDate)}
                />
              </div>
              <div className="fld">
                <label htmlFor="vendorReturnPlanned">戻り予定日</label>
                <input
                  className="inp"
                  id="vendorReturnPlanned"
                  name="vendorReturnPlanned"
                  type="date"
                  defaultValue={toInputDate(v.vendorReturnPlanned)}
                />
              </div>
            </div>
            {showStatusAndActualReturn && (
              <div className="fld">
                <label htmlFor="vendorReturnActual">
                  実際の戻り日<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
                    戻ってきたら入れる
                  </em>
                </label>
                <input
                  className="inp"
                  id="vendorReturnActual"
                  name="vendorReturnActual"
                  type="date"
                  defaultValue={toInputDate(v.vendorReturnActual)}
                />
              </div>
            )}
            {!showStatusAndActualReturn && (
              <div className="note" style={{ margin: "4px 0 0" }}>
                実際の戻り日は、戻ってきた時点で製品詳細から記録します。
              </div>
            )}
          </>
        )}
      </div>

      {showStatusAndActualReturn && (
        <>
          <div className="eyebrow">状態</div>
          <div className="card">
            <RadioSeg3
              name="status"
              options={["未着手", "製作中", "完了", "出荷済"]}
              defaultValue={v.status}
            />
          </div>
        </>
      )}

      {!showStatusAndActualReturn && templates && templates.length > 0 && (
        <>
          <div className="eyebrow">工程</div>
          <div className="card">
            <div className="fld">
              <label htmlFor="templateName">テンプレート</label>
              <select
                className="inp"
                id="templateName"
                name="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.templateName} value={t.templateName}>
                    {t.templateName}（{t.processes.length}工程）
                  </option>
                ))}
              </select>
            </div>
            {selectedTemplate && selectedTemplate.processes.length > 0 && (
              <div className="tpl">
                {selectedTemplate.processes.map((p) => (
                  <span key={p.processName}>
                    {p.processName} {p.weight}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="fld" style={{ marginTop: 14 }}>
        <label htmlFor="note">備考</label>
        <textarea className="inp" id="note" name="note" rows={2} defaultValue={v.note} placeholder="任意" />
      </div>

      {state.error && <p className="errtext">{state.error}</p>}
      <button className="btn wide" type="submit" disabled={pending}>
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}
