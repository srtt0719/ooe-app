import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";

export default async function FinishedListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
      status: { in: ["完了", "出荷済"] },
      ...(query
        ? {
            OR: [
              { productName: { contains: query, mode: "insensitive" } },
              { orderNumber: { contains: query, mode: "insensitive" } },
              { site: { siteName: { contains: query, mode: "insensitive" } } },
              { site: { orderNumber: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      site: true,
      checkRecords: { orderBy: { checkedAt: "desc" } },
    },
  });

  return (
    <div>
      <AppHeader title="作業終了リスト" subtitle="送信済み" />
      <div className="wrap">
        <form>
          <input
            className="search"
            name="q"
            defaultValue={query}
            placeholder="現場名・製品名・注番で検索"
          />
        </form>

        {products.length === 0 && (
          <p className="sub" style={{ marginTop: 16 }}>
            該当する製品がありません。
          </p>
        )}

        {products.map((product) => {
          const latestAt = product.checkRecords[0]?.checkedAt ?? null;
          const latestBatch = latestAt
            ? product.checkRecords.filter((r) => r.checkedAt.getTime() === latestAt.getTime())
            : [];
          const okCount = latestBatch.filter((r) => r.result === "OK").length;
          const checkerName = latestBatch[0]?.checkerName ?? null;

          return (
            <Link className="card tap" href={`/products/${product.productId}`} key={product.productId}>
              <div className="row">
                <div>
                  <div className="name">{product.productName}</div>
                  <div className="sub">
                    {product.site.siteName}
                    {product.site.orderNumber && (
                      <>
                        {" ／ "}
                        <span className="num">{product.site.orderNumber}</span>
                      </>
                    )}
                  </div>
                </div>
                {latestAt && <div className="due">{fmtDate(latestAt)} 送信</div>}
              </div>
              <div className="chips">
                {latestBatch.length > 0 && (
                  <span className={`chip${okCount === latestBatch.length ? " ok" : ""}`}>
                    チェック {okCount}/{latestBatch.length}
                  </span>
                )}
                {checkerName && <span className="chip">{checkerName}</span>}
              </div>
            </Link>
          );
        })}

        <div className="note">
          チェックが全項目埋まっていないものも記録として残ります。何個中何個を確認して出したかが、後から追える状態にしておくのが目的です。
        </div>
      </div>
    </div>
  );
}
