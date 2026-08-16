"use client";

import { useRef } from "react";

export function FileMemoField({
  memo,
  action,
}: {
  memo: string | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input
        className="fmemo-input"
        type="text"
        name="memo"
        defaultValue={memo ?? ""}
        placeholder="一行メモ（例：架台A バラシ図）"
        onBlur={() => formRef.current?.requestSubmit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </form>
  );
}
