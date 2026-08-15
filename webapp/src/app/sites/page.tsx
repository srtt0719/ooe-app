import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate, isNear } from "@/lib/format";
import { DAYS_BEFORE_NEAR } from "@/lib/constants";
import { AppHeader } from "@/components/AppHeader";

export default async function SiteListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const sites = await prisma.site.findMany({
    where: {
      isDeleted: false,
      ...(query
        ? {
            OR: [
              { siteName: { contains: query, mode: "insensitive" } },
              { clientName: { contains: query, mode: "insensitive" } },
              { orderNumber: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { siteName: "asc" },
    include: {
      products: {
        where: { isDeleted: false, status: { notIn: ["完了", "出荷済"] } },
        select: { materialStatus: true },
      },
    },
  });

  return (
    <div>
      <AppHeader title="全現場・製品" subtitle="現場順" />
      <div className="wrap">
        <form>
          <input
            className="search"
            name="q"
            defaultValue={query}
            placeholder="現場名・客先・注番で検索"
          />
        </form>
        <div className="sorter">
          <span className="on" style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
            現場順
          </span>
          <Link href="/products">納期順</Link>
        </div>

        {sites.length === 0 && (
          <p className="sub" style={{ marginTop: 16 }}>
            該当する現場がありません。
          </p>
        )}

        {sites.map((site) => {
          const materialUnordered = site.products.filter(
            (p) => p.materialStatus === "未発注",
          ).length;
          return (
            <Link className="card tap" href={`/sites/${site.siteId}`} key={site.siteId}>
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
                <div className="due">製品 {site.products.length}</div>
              </div>
              <div className="chips">
                {site.status === "完了" ? (
                  <span className="chip ok">完了</span>
                ) : site.status === "保留" ? (
                  <span className="chip">保留</span>
                ) : null}
                {site.deliveryDueDate && (
                  <span
                    className={`chip${isNear(site.deliveryDueDate, DAYS_BEFORE_NEAR) ? " alert" : ""}`}
                  >
                    現場搬入 {fmtDate(site.deliveryDueDate)}
                  </span>
                )}
                {materialUnordered > 0 && (
                  <span className="chip alert">材料 未発注 {materialUnordered}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
