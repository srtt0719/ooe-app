import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate, isNear } from "@/lib/format";
import { DAYS_BEFORE_NEAR } from "@/lib/constants";
import { AppHeader } from "@/components/AppHeader";
import { ProgressMeter } from "@/components/ProgressMeter";
import { DeleteSection } from "@/components/DeleteSection";
import { deleteSite } from "../actions";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId: siteIdStr } = await params;
  const siteId = Number(siteIdStr);

  const site = await prisma.site.findUnique({
    where: { siteId },
    include: {
      manager: true,
      products: {
        // チェック完了・出荷済の製品は作業終了リストへ移り、現場ページの通常一覧には出さない(仕様書4-7)
        where: { isDeleted: false, status: { notIn: ["完了", "出荷済"] } },
        orderBy: { productName: "asc" },
        include: { processes: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!site || site.isDeleted) notFound();

  // 完成チェック済み・出荷済の製品は現場を削除しても記録として残るため、
  // 「空になった現場」の判定はここに表示されている進行中の製品だけで見てよい。
  const boundDeleteSite = deleteSite.bind(null, siteId);

  return (
    <div>
      <AppHeader title={site.siteName} subtitle="現場" backHref="/sites" />
      <div className="wrap">
        <div className="card">
          <div className="row">
            <div>
              <div className="name">{site.siteName}</div>
              <div className="sub">
                {site.clientName}
                {site.clientName && site.orderNumber && " ／ "}
                {site.orderNumber && (
                  <>
                    注番 <span className="num">{site.orderNumber}</span>
                  </>
                )}
              </div>
            </div>
            <Link className="btn ghost" href={`/sites/${site.siteId}/edit`}>
              編集
            </Link>
          </div>
          <div className="chips">
            {site.deliveryDueDate && (
              <span
                className={`chip${isNear(site.deliveryDueDate, DAYS_BEFORE_NEAR) ? " alert" : ""}`}
              >
                現場搬入 {fmtDate(site.deliveryDueDate)}
              </span>
            )}
            <span className="chip">{site.status}</span>
            {site.manager && <span className="chip">担当 {site.manager.userName}</span>}
          </div>
          {site.siteAddress && <div className="sub" style={{ marginTop: 9 }}>{site.siteAddress}</div>}
          {site.note && <div className="sub" style={{ marginTop: 5 }}>{site.note}</div>}
        </div>

        <div className="eyebrow">
          製品 <span className="count">{site.products.length}</span>
        </div>

        <Link className="add" href={`/products/new?siteId=${site.siteId}`}>
          ＋ 製品を登録
        </Link>

        {site.products.length === 0 && (
          <p className="sub" style={{ marginTop: 4 }}>
            まだ製品が登録されていません。
          </p>
        )}

        {site.products.map((product) => (
          <Link className="card tap" href={`/products/${product.productId}`} key={product.productId}>
            <div className="row">
              <div>
                <div className="name">{product.productName}</div>
                <div className="sub">
                  {[product.material, product.thickness, product.finish, product.quantity ? `${product.quantity}台` : null]
                    .filter(Boolean)
                    .join(" ／ ")}
                </div>
              </div>
              {product.processDueDate && (
                <div
                  className={`due${isNear(product.processDueDate, DAYS_BEFORE_NEAR) ? " near" : ""}`}
                >
                  {fmtDate(product.processDueDate)}
                </div>
              )}
            </div>
            {product.materialStatus === "未発注" && (
              <div className="chips">
                <span className="chip alert">材料 未発注</span>
              </div>
            )}
            <ProgressMeter processes={product.processes} compact />
          </Link>
        ))}

        {site.products.length === 0 && (
          <DeleteSection
            label="この現場"
            impactText="進行中の製品はありません。削除すると一覧に表示されなくなります（完成チェック済みの記録があれば作業終了リストに残ります）。"
            action={boundDeleteSite}
          />
        )}
      </div>
    </div>
  );
}
