import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { fmtDateTime } from "@/lib/format";
import { restoreSite, restoreProduct } from "./actions";

export default async function TrashPage() {
  const [sites, products] = await Promise.all([
    prisma.site.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.product.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { site: true },
    }),
  ]);

  return (
    <div>
      <AppHeader title="削除済み" subtitle="設定" backHref="/settings" />
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          削除は見た目上だけで、データは残っています。誤って削除したものはここから元に戻せます。
        </div>

        <div className="eyebrow">
          現場 <span className="count">{sites.length}</span>
        </div>
        {sites.length === 0 && <p className="sub">削除済みの現場はありません。</p>}
        {sites.map((site) => (
          <div className="card" key={site.siteId}>
            <div className="row">
              <div>
                <div className="name">{site.siteName}</div>
                <div className="sub">
                  {site.clientName} ／ 削除日時 {fmtDateTime(site.updatedAt)}
                </div>
              </div>
              <form action={restoreSite.bind(null, site.siteId)}>
                <button className="btn ghost" type="submit">
                  復元
                </button>
              </form>
            </div>
          </div>
        ))}

        <div className="eyebrow">
          製品 <span className="count">{products.length}</span>
        </div>
        {products.length === 0 && <p className="sub">削除済みの製品はありません。</p>}
        {products.map((product) => (
          <div className="card" key={product.productId}>
            <div className="row">
              <div>
                <div className="name">{product.productName}</div>
                <div className="sub">
                  {product.site.siteName}
                  {product.site.isDeleted && "（現場も削除済み）"} ／ 削除日時 {fmtDateTime(product.updatedAt)}
                </div>
              </div>
              <form action={restoreProduct.bind(null, product.productId)}>
                <button className="btn ghost" type="submit">
                  復元
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
