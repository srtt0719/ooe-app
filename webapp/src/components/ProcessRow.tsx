"use client";

import { useState, useTransition } from "react";
import { fmtDateTime } from "@/lib/format";
import { startProcess, completeProcess } from "@/app/products/processActions";
import type { AlertInfo } from "@/lib/processAlert";

type ProcessData = {
  processId: number;
  processName: string;
  isCompleted: boolean;
  startedAt: Date | null;
  startedBy: string | null;
  completedAt: Date | null;
  completedBy: string | null;
};

export function ProcessRow({
  process,
  productId,
  alertInfo,
  defaultUserName,
}: {
  process: ProcessData;
  productId: number;
  alertInfo: AlertInfo | null;
  defaultUserName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"start" | "complete" | null>(null);
  const [name, setName] = useState(defaultUserName);

  const isStarted = Boolean(process.startedAt);
  const isDone = process.isCompleted;

  function openDialog(kind: "start" | "complete") {
    setName(defaultUserName);
    setDialog(kind);
  }

  function confirmStart() {
    const performedBy = name;
    setDialog(null);
    startTransition(() => {
      startProcess(process.processId, productId, performedBy);
    });
  }

  function confirmComplete() {
    const performedBy = name;
    setDialog(null);
    startTransition(() => {
      completeProcess(process.processId, productId, performedBy);
    });
  }

  return (
    <>
      <div className="proc">
        <div className={`mark${isDone ? " done" : isStarted ? " now" : ""}`}>
          {isDone && "✓"}
        </div>
        <div className={`pname${isDone ? " done" : ""}`}>
          {isDone ? <b>{process.processName}</b> : process.processName}
          {isDone && (
            <div className="pmeta">
              {fmtDateTime(process.completedAt)} ／ {process.completedBy}
            </div>
          )}
          {!isDone && isStarted && (
            <div className="pmeta now">
              着手 {fmtDateTime(process.startedAt)} ／ {process.startedBy}
            </div>
          )}
        </div>
        {!isDone && !isStarted && (
          <button className="btn ghost" type="button" disabled={pending} onClick={() => openDialog("start")}>
            着手
          </button>
        )}
        {!isDone && isStarted && (
          <button className="btn done" type="button" disabled={pending} onClick={() => openDialog("complete")}>
            完了
          </button>
        )}
      </div>

      {dialog === "start" && (
        <div className="veil">
          <div className="modal">
            <div className="mh">
              <h3>{alertInfo?.message ?? `${process.processName}に着手します`}</h3>
            </div>
            {alertInfo && alertInfo.fields.length > 0 && (
              <div className="data">
                <dl>
                  {alertInfo.fields.map((f) => (
                    <div key={f.label} style={{ display: "contents" }}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="fld" style={{ padding: "0 20px", marginTop: 14 }}>
              <label htmlFor={`start-name-${process.processId}`}>着手者</label>
              <input
                className="inp"
                id={`start-name-${process.processId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力"
              />
            </div>
            <div className="mf">
              <button className="btn ghost" type="button" onClick={() => setDialog(null)}>
                戻る
              </button>
              <button className="btn" type="button" onClick={confirmStart} disabled={!name.trim()}>
                この内容で着手
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog === "complete" && (
        <div className="veil">
          <div className="modal">
            <div className="mh">
              <h3>{process.processName}を完了しますか</h3>
            </div>
            <div className="fld" style={{ padding: "0 20px", marginTop: 4 }}>
              <label htmlFor={`complete-name-${process.processId}`}>完了者</label>
              <input
                className="inp"
                id={`complete-name-${process.processId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力"
              />
            </div>
            <div className="mf">
              <button className="btn ghost" type="button" onClick={() => setDialog(null)}>
                戻る
              </button>
              <button className="btn done" type="button" onClick={confirmComplete} disabled={!name.trim()}>
                完了にする
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
