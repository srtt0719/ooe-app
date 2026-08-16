"use client";

import { useState } from "react";

// 削除は確認ダイアログを一段階挟む(誤タップ防止)。誤操作時に復旧できるよう、
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
  const [open, setOpen] = useState(false);

  return (
    <div className="danger">
      <button className="del" type="button" onClick={() => setOpen(true)}>
        {label}を削除
      </button>

      {open && (
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
              <button className="btn ghost" type="button" onClick={() => setOpen(false)}>
                やめる
              </button>
              <form action={action}>
                <button
                  className="btn"
                  type="submit"
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
