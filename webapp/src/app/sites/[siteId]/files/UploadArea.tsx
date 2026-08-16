"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export function UploadArea({
  uploadAction,
}: {
  uploadAction: (formData: FormData) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const submitFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const formData = new FormData();
      for (const f of files) formData.append("files", f);
      startTransition(() => {
        uploadAction(formData);
      });
    },
    [uploadAction],
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) submitFiles(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [submitFiles]);

  return (
    <div
      className="drop"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        submitFiles(e.dataTransfer.files);
      }}
      style={dragOver ? { background: "#eef0ec" } : undefined}
    >
      <b>{pending ? "アップロード中…" : "資料を追加する"}</b>
      <span>図面・写真・その他 なんでも入れられます</span>
      <div className="dbtns">
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() => fileInputRef.current?.click()}
        >
          ファイルを選ぶ
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={pending}
          onClick={() => cameraInputRef.current?.click()}
        >
          写真を撮る
        </button>
      </div>
      <div className="dhint">PCならこの枠にドラッグ&ドロップ、貼り付け（Ctrl+V）も使えます</div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) submitFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          if (e.target.files) submitFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
