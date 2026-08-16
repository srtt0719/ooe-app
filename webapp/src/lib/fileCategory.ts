const DRAWING_EXTS = new Set(["pdf", "dwg", "dxf"]);
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "heic", "heif", "webp", "bmp"]);

export type FileCategory = "図面" | "写真" | "その他";

export function extOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

// 拡張子から「図面(PDF/DWG/DXF)」「写真」「その他」に自動仕分け(仕様書4-2)
export function categorize(fileName: string): FileCategory {
  const ext = extOf(fileName);
  if (DRAWING_EXTS.has(ext)) return "図面";
  if (IMAGE_EXTS.has(ext)) return "写真";
  return "その他";
}

// 一覧のアイコンバッジの色分け用クラス(.ext.pdf / .ext.dwg / .ext.img / .ext.etc)
export function extBadgeClass(fileName: string): string {
  const ext = extOf(fileName);
  if (ext === "pdf") return "pdf";
  if (ext === "dwg" || ext === "dxf") return "dwg";
  if (IMAGE_EXTS.has(ext)) return "img";
  return "etc";
}
