"use client";

import { useState } from "react";

// 削除は二段階確認(仕様書4-4)。誤操作時に復旧できるよう、
// 実際の処理は物理削除ではなく is_deleted フラグを立てるだけ(呼び出し先のaction側で担保)。
export function DeleteSection({
  label,
  impactText,
  action,
}: {
  label: string;
  impactText: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="danger">
      <button className="del" type="button" onClick={() => setStep(1)}>
        {label}を削除
      </button>

      {step === 1 && (
        <div className="veil">
          <div className="modal">
            <div className="mh">
              <h3>{label}を削除します</h3>
              <p style={{ fontSize: 13.5, color: "var(--steel)", marginTop: 9, lineHeight: 1.6 }}>
                以下も一緒に見えなくなります。
              </p>
            </div>
            <div className="mbody">{impactText}</div>
            <div className="mf">
              <button className="btn ghost" type="button" onClick={() => setStep(0)}>
                やめる
              </button>
              <button
                className="btn"
                type="button"
                style={{ background: "var(--primer)", borderColor: "var(--primer)" }}
                onClick={() => setStep(2)}
              >
                削除に進む
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="veil">
          <div className="modal">
            <div className="mh">
              <h3>本当に削除しますか</h3>
              <p style={{ fontSize: 13.5, color: "var(--steel)", marginTop: 9, lineHeight: 1.6 }}>
                確認のため、下に「削除」と入力してください。
              </p>
              <input
                className="inp"
                style={{ marginTop: 12 }}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="削除"
              />
            </div>
            <div className="mf">
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setStep(0);
                  setConfirmText("");
                }}
              >
                やめる
              </button>
              <form action={action}>
                <button
                  className="btn"
                  type="submit"
                  disabled={confirmText !== "削除"}
                  style={{ background: "var(--primer)", borderColor: "var(--primer)" }}
                >
                  削除する
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
