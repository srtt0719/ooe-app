"use client";

import { useActionState } from "react";
import { SITE_STATUS } from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { RadioSeg3 } from "@/components/RadioSeg3";
import type { FormState } from "./actions";

type SiteInitial = {
  siteName: string;
  clientName: string;
  orderNumber: string;
  deliveryDueDate: Date | null;
  managerUserId: number | null;
  siteAddress: string;
  note: string;
  status: string;
};

const emptyInitial: SiteInitial = {
  siteName: "",
  clientName: "",
  orderNumber: "",
  deliveryDueDate: null,
  managerUserId: null,
  siteAddress: "",
  note: "",
  status: "進行中",
};

export function SiteForm({
  action,
  users,
  initial,
  submitLabel,
  showStatus,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  users: { userId: number; userName: string }[];
  initial?: Partial<SiteInitial>;
  submitLabel: string;
  showStatus?: boolean;
}) {
  const v = { ...emptyInitial, ...initial };
  const [state, formAction, pending] = useActionState(action, { error: "" });

  return (
    <form action={formAction}>
      <div className="card">
        <div className="fld">
          <label htmlFor="siteName">現場名</label>
          <input
            className="inp"
            id="siteName"
            name="siteName"
            defaultValue={v.siteName}
            placeholder="○○工場増築"
            required
          />
        </div>
        <div className="fld">
          <label htmlFor="clientName">客先</label>
          <input
            className="inp"
            id="clientName"
            name="clientName"
            defaultValue={v.clientName}
            placeholder="A建設"
          />
        </div>
        <div className="fld">
          <label htmlFor="orderNumber">発注番号</label>
          <input
            className="inp"
            id="orderNumber"
            name="orderNumber"
            defaultValue={v.orderNumber}
            placeholder="A-24-0815"
          />
        </div>
        <div className="fld">
          <label htmlFor="deliveryDueDate">現場搬入納期</label>
          <input
            className="inp"
            id="deliveryDueDate"
            name="deliveryDueDate"
            type="date"
            defaultValue={toInputDate(v.deliveryDueDate)}
          />
        </div>
        <div className="fld">
          <label htmlFor="managerUserId">
            担当者<em style={{ fontStyle: "normal", fontWeight: 400, color: "#A9AFB4", marginLeft: 7 }}>
              完成チェックの通知が届きます
            </em>
          </label>
          <select
            className="inp"
            id="managerUserId"
            name="managerUserId"
            defaultValue={v.managerUserId ?? ""}
          >
            <option value="">未設定</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName}
              </option>
            ))}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="siteAddress">現場住所</label>
          <input
            className="inp"
            id="siteAddress"
            name="siteAddress"
            defaultValue={v.siteAddress}
            placeholder="任意"
          />
        </div>
        {showStatus && (
          <div className="fld">
            <label>状態</label>
            <RadioSeg3 name="status" options={SITE_STATUS} defaultValue={v.status} />
          </div>
        )}
        <div className="fld">
          <label htmlFor="note">備考</label>
          <textarea
            className="inp"
            id="note"
            name="note"
            rows={2}
            defaultValue={v.note}
            placeholder="任意"
          />
        </div>
      </div>
      {state.error && <p className="errtext">{state.error}</p>}
      <button className="btn wide" type="submit" disabled={pending}>
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}
