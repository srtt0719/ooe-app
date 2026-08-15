"use client";

import { useActionState, useState } from "react";
import { MATERIAL_STATUS, SURFACE_TYPE } from "@/lib/constants";
import { RadioSeg3 } from "@/components/RadioSeg3";
import { createSiteAndProduct, type FormState } from "./actions";

type TemplateWithProcesses = {
  templateName: string;
  processes: { processName: string; weight: number }[];
};

export function RegisterForm({
  users,
  templates,
  materialOptions,
  finishOptions,
  vendorNames,
}: {
  users: { userId: number; userName: string }[];
  templates: TemplateWithProcesses[];
  materialOptions: string[];
  finishOptions: string[];
  vendorNames: string[];
}) {
  const [state, formAction, pending] = useActionState(createSiteAndProduct, { error: "" } as FormState);
  const [surfaceType, setSurfaceType] = useState("自社");
  const [templateName, setTemplateName] = useState(templates[0]?.templateName ?? "");
  const selectedTemplate = templates.find((t) => t.templateName === templateName);

  return (
    <form action={formAction}>
      <div className="eyebrow">現場</div>
      <div className="card">
        <div className="fld">
          <label htmlFor="siteName">現場名</label>
          <input className="inp" id="siteName" name="siteName" placeholder="○○工場増築" required />
        </div>
        <div className="fld2">
          <div className="fld">
            <label htmlFor="clientName">客先</label>
            <input className="inp" id="clientName" name="clientName" placeholder="A建設" />
          </div>
          <div className="fld">
            <label htmlFor="orderNumber">発注番号</label>
            <input className="inp num" id="orderNumber" name="orderNumber" placeholder="A-24-0815" />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="deliveryDueDate">現場搬入納期</label>
          <input className="inp" id="deliveryDueDate" name="deliveryDueDate" type="date" />
        </div>
        <div className="fld">
          <label htmlFor="managerUserId">
            担当者<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              完成チェックの通知が届きます
            </em>
          </label>
          <select className="inp" id="managerUserId" name="managerUserId" defaultValue="">
            <option value="">未設定</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="eyebrow">製品</div>
      <div className="card">
        <div className="fld">
          <label htmlFor="productName">製品名</label>
          <input className="inp" id="productName" name="productName" placeholder="架台A" required />
        </div>
        <div className="fld2">
          <div className="fld">
            <label htmlFor="quantity">数量</label>
            <input className="inp" id="quantity" name="quantity" placeholder="10" />
          </div>
          <div className="fld">
            <label htmlFor="drawingNumber">図番</label>
            <input className="inp num" id="drawingNumber" name="drawingNumber" placeholder="A-123" />
          </div>
        </div>
        <div className="fld2">
          <div className="fld">
            <label htmlFor="material">素材</label>
            <select className="inp" id="material" name="material" defaultValue={materialOptions[0]}>
              {materialOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="fld">
            <label htmlFor="thickness">板厚</label>
            <input className="inp num" id="thickness" name="thickness" placeholder="t9" />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="finish">仕上げ</label>
          <select className="inp" id="finish" name="finish" defaultValue={finishOptions[0]}>
            {finishOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
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
          <input className="inp" id="processDueDate" name="processDueDate" type="date" />
        </div>
        <div className="fld">
          <label htmlFor="deliveryDate">
            現場搬入予定日<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              現場へ持っていく日
            </em>
          </label>
          <input className="inp" id="deliveryDate" name="deliveryDate" type="date" />
        </div>
      </div>

      <div className="eyebrow">材料</div>
      <div className="card">
        <div className="fld">
          <label>材料の状態</label>
          <RadioSeg3 name="materialStatus" options={MATERIAL_STATUS} defaultValue="未発注" />
        </div>
        <div className="fld">
          <label htmlFor="materialArrivalDate">入荷予定日</label>
          <input className="inp" id="materialArrivalDate" name="materialArrivalDate" type="date" />
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
                <input className="inp" id="vendorSendDate" name="vendorSendDate" type="date" />
              </div>
              <div className="fld">
                <label htmlFor="vendorReturnPlanned">戻り予定日</label>
                <input className="inp" id="vendorReturnPlanned" name="vendorReturnPlanned" type="date" />
              </div>
            </div>
          </>
        )}
      </div>

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
        <div className="note" style={{ margin: "10px 0 0" }}>
          登録後、この製品だけ工程を足したり重みを変えたりできます（今後のフェーズで対応）。
        </div>
      </div>

      {state.error && <p className="errtext">{state.error}</p>}
      <button className="btn wide" type="submit" disabled={pending}>
        {pending ? "登録中…" : "現場と製品を登録"}
      </button>
    </form>
  );
}
