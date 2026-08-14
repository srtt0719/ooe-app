import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: productIdStr } = await params;
  const productId = Number(productIdStr);

  const product = await prisma.product.findUnique({
    where: { productId },
    include: { site: true },
  });

  if (!product || product.isDeleted) notFound();

  return (
    <div>
      <AppHeader
        title={product.productName}
        subtitle={product.site.siteName}
        backHref={`/sites/${product.siteId}`}
      />
      <div className="wrap">
        <div className="card">
          <div className="row">
            <div>
              <div className="name">{product.productName}</div>
              <div className="sub">
                {product.site.siteName}
                {product.site.clientName && ` ／ ${product.site.clientName}`}
              </div>
            </div>
            <Link className="btn ghost" href={`/products/${product.productId}/edit`}>
              編集
            </Link>
          </div>
          <div className="spec">
            <dl>
              <dt>数量</dt>
              <dd>{product.quantity ? `${product.quantity} 台` : "—"}</dd>
              <dt>素材</dt>
              <dd>
                {product.material}
                {product.thickness && (
                  <>
                    {" "}
                    <span className="num">{product.thickness}</span>
                  </>
                )}
              </dd>
              <dt>仕上げ</dt>
              <dd>
                {product.finish}
                {product.surfaceType === "外注" && product.vendorName
                  ? `（外注・${product.vendorName}）`
                  : product.surfaceType === "外注"
                    ? "（外注）"
                    : ""}
              </dd>
              <dt>図番</dt>
              <dd className="num">{product.drawingNumber || "—"}</dd>
              <dt>材料</dt>
              <dd
                style={{
                  color:
                    product.materialStatus === "入荷済"
                      ? "var(--patina)"
                      : product.materialStatus === "未発注"
                        ? "var(--primer)"
                        : undefined,
                }}
              >
                {product.materialStatus}
              </dd>
              <dt>加工納期</dt>
              <dd>{product.processDueDate ? fmtDate(product.processDueDate) : "—"}</dd>
              <dt>現場搬入</dt>
              <dd>{product.deliveryDate ? fmtDate(product.deliveryDate) : "—"}</dd>
              {product.surfaceType === "外注" && (
                <>
                  <dt>外注戻り</dt>
                  <dd>
                    {product.vendorReturnActual
                      ? `実績 ${fmtDate(product.vendorReturnActual)}`
                      : product.vendorReturnPlanned
                        ? `予定 ${fmtDate(product.vendorReturnPlanned)}`
                        : "—"}
                  </dd>
                </>
              )}
            </dl>
          </div>
          {product.note && <div className="sub" style={{ marginTop: 9 }}>{product.note}</div>}
        </div>

        <div className="note">
          工程の管理（着手・完了ボタン、進捗メーター）はフェーズ3で追加します。現在は製品情報の登録・確認までです。
        </div>
      </div>
    </div>
  );
}
