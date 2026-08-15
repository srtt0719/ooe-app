// 完成チェックの項目名から、併記すべき指示値を組み立てる(仕様書4-6)。
// 例:「材料・板厚は図面通りか」→「指示：SS400 t3.2 ／ 図番 A-125」
export function buildCheckHint(
  itemName: string,
  product: {
    material: string | null;
    thickness: string | null;
    drawingNumber: string | null;
    finish: string | null;
    quantity: number | null;
  },
): string | null {
  const parts: string[] = [];

  if (itemName.includes("材料") || itemName.includes("板厚")) {
    if (product.material) parts.push(product.material);
    if (product.thickness) parts.push(product.thickness);
    if (product.drawingNumber) parts.push(`図番 ${product.drawingNumber}`);
  } else if (itemName.includes("仕上げ")) {
    if (product.finish) parts.push(product.finish);
  } else if (itemName.includes("数量")) {
    if (product.quantity) parts.push(`${product.quantity} 台`);
  } else if (itemName.includes("図面") || itemName.includes("寸法") || itemName.includes("穴")) {
    if (product.drawingNumber) parts.push(`図番 ${product.drawingNumber}`);
  }

  if (parts.length === 0) return null;
  return `指示：${parts.join(" ／ ")}`;
}
