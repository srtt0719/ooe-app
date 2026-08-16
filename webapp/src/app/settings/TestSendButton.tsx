"use client";

import { useState, useTransition } from "react";

type TestResult = { ok: boolean; error?: string };

export function TestSendButton({
  action,
  label,
}: {
  action: () => Promise<TestResult>;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<TestResult | null>(null);

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        className="btn ghost"
        disabled={pending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            setResult(await action());
          });
        }}
      >
        {pending ? "送信中…" : label}
      </button>
      {result &&
        (result.ok ? (
          <p className="oktext">送信できました。LINE WORKSを確認してください。</p>
        ) : (
          <p className="errtext">{result.error}</p>
        ))}
    </div>
  );
}
