import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { buildCheckHint } from "@/lib/checkItemHint";
import { getSetting } from "@/lib/settings";
import { currentUserName } from "../../processActions";
import { CheckForm } from "./CheckForm";

export default async function CheckPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: productIdStr } = await params;
  const productId = Number(productIdStr);

  const product = await prisma.product.findUnique({
    where: { productId },
    include: { site: true, processes: true },
  });
  if (!product || product.isDeleted) notFound();

  const total = product.processes.reduce((s, p) => s + p.weight, 0);
  const done = product.processes.filter((p) => p.isCompleted).reduce((s, p) => s + p.weight, 0);
  const allCompleted = product.processes.length > 0 && done === total;
  if (!allCompleted) redirect(`/products/${productId}`);

  const [checkItems, notifyGroup, defaultCheckerName] = await Promise.all([
    prisma.checkItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getSetting("notify_check_group"),
    currentUserName(),
  ]);

  const items = checkItems.map((item) => ({
    itemId: item.itemId,
    itemName: item.itemName,
    hint: buildCheckHint(item.itemName, {
      material: product.material,
      thickness: product.thickness,
      drawingNumber: product.drawingNumber,
      finish: product.finish,
      quantity: product.quantity,
    }),
  }));

  return (
    <div>
      <AppHeader title="完成チェック" subtitle={product.productName} backHref={`/products/${productId}`} />
      <div className="wrap">
        <div className="card">
          <div className="row">
            <div>
              <div className="name">{product.productName}</div>
              <div className="sub">
                {product.site.siteName} ／ {product.material} {product.thickness} ／{" "}
                {product.quantity ? `${product.quantity}台` : ""}
              </div>
            </div>
            <div className="due" style={{ color: "var(--patina)", fontWeight: 600 }}>
              100%
            </div>
          </div>
        </div>

        <div className="eyebrow">完成チェック</div>
        <CheckForm
          productId={productId}
          items={items}
          defaultCheckerName={defaultCheckerName}
          notifyReady={Boolean(notifyGroup)}
        />
      </div>
    </div>
  );
}
