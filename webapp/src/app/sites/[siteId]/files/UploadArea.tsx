"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export function UploadArea({
  siteId,
  recordAction,
}: {
  siteId: number;
  recordAction: (info: { fileName: string; pathname: string }) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const submitFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      setBusy(true);
      setError(null);
      try {
        for (const file of files) {
          const blob = await upload(`sites/${siteId}/${Date.now()}-${file.name}`, file, {
            access: "private",
            handleUploadUrl: "/api/blob/upload",
          });
          await recordAction({ fileName: file.name, pathname: blob.pathname });
        }
      } catch (e) {
        console.error(e);
        setError("アップロードに失敗しました。通信環境をご確認のうえ、もう一度お試しください。");
      } finally {
        setBusy(false);
      }
    },
    [siteId, recordAction],
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
      <b>{busy ? "アップロード中…" : "資料を追加する"}</b>
      <span>図面・写真・その他 なんでも入れられます</span>
      <div className="dbtns">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          ファイルを選ぶ
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={() => cameraInputRef.current?.click()}
        >
          写真を撮る
        </button>
      </div>
      <div className="dhint">PCならこの枠にドラッグ&ドロップ、貼り付け（Ctrl+V）も使えます</div>
      {error && <p className="errtext">{error}</p>}

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
