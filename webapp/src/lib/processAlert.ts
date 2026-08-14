// 仕様書5-4: 着手時の注意喚起。工程名に応じて、確認してほしい実データを併記する。
export type AlertField = { label: string; value: string };
export type AlertInfo = { message: string | null; fields: AlertField[] };

export function buildAlertInfo(
  processName: string,
  alertMessage: string | null,
  product: {
    material: string | null;
    thickness: string | null;
    drawingNumber: string | null;
    finish: string | null;
  },
): AlertInfo | null {
  const fields: AlertField[] = [];

  if (processName === "切断") {
    if (product.material) fields.push({ label: "素材", value: product.material });
    if (product.thickness) fields.push({ label: "板厚", value: product.thickness });
    if (product.drawingNumber) fields.push({ label: "図番", value: product.drawingNumber });
  } else if (processName === "穴あけ") {
    if (product.drawingNumber) fields.push({ label: "図番", value: product.drawingNumber });
  } else if (processName === "塗装・研磨") {
    if (product.finish) fields.push({ label: "仕上げ", value: product.finish });
  }

  if (!alertMessage && fields.length === 0) return null;
  return { message: alertMessage, fields };
}
