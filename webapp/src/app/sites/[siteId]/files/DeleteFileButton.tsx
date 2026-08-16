"use client";

import { useTransition } from "react";

export function DeleteFileButton({
  fileName,
  action,
}: {
  fileName: string;
  action: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm(`「${fileName}」を削除しますか？`)) return;
        startTransition(() => {
          action();
        });
      }}
    >
      削除
    </button>
  );
}
