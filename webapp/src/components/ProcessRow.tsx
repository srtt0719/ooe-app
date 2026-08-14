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
}: {
  process: ProcessData;
  productId: number;
  alertInfo: AlertInfo | null;
}) {
  const [pending, startTransition] = useTransition();
  const [showAlert, setShowAlert] = useState(false);

  const isStarted = Boolean(process.startedAt);
  const isDone = process.isCompleted;

  function doStart() {
    setShowAlert(false);
    startTransition(() => {
      startProcess(process.processId, productId);
    });
  }

  function handleStartClick() {
    if (alertInfo) {
      setShowAlert(true);
    } else {
      doStart();
    }
  }

  function doComplete() {
    startTransition(() => {
      completeProcess(process.processId, productId);
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
          <button className="btn ghost" type="button" disabled={pending} onClick={handleStartClick}>
            着手
          </button>
        )}
        {!isDone && isStarted && (
          <button className="btn done" type="button" disabled={pending} onClick={doComplete}>
            完了
          </button>
        )}
      </div>

      {showAlert && alertInfo && (
        <div className="veil">
          <div className="modal">
            <div className="mh">
              <h3>{alertInfo.message ?? `${process.processName}を開始しますか`}</h3>
            </div>
            {alertInfo.fields.length > 0 && (
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
            <div className="mf">
              <button className="btn ghost" type="button" onClick={() => setShowAlert(false)}>
                戻る
              </button>
              <button className="btn" type="button" onClick={doStart}>
                確認して着手
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
