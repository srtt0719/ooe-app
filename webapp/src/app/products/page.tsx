import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fmtDate, isNear } from "@/lib/format";
import { DAYS_BEFORE_NEAR } from "@/lib/constants";
import { AppHeader } from "@/components/AppHeader";
import { ProgressMeter } from "@/components/ProgressMeter";

const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "this-week", label: "今週納期" },
  { key: "this-month", label: "今月納期" },
  { key: "material-unordered", label: "材料 未発注" },
  { key: "vendor-overdue", label: "外注 戻り遅れ" },
  { key: "incomplete", label: "未完了" },
] as const;

function buildFilterWhere(filter: string): Prisma.ProductWhereInput {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case "this-week": {
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      return { processDueDate: { gte: today, lte: end } };
    }
    case "this-month": {
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { processDueDate: { gte: today, lte: end } };
    }
    case "material-unordered":
      return { materialStatus: "未発注" };
    case "vendor-overdue":
      return { vendorSendDate: { not: null }, vendorReturnActual: null };
    case "incomplete":
      return { status: { notIn: ["完了", "出荷済"] } };
    default:
      return {};
  }
}

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterRaw } = await searchParams;
  const filter = FILTERS.some((f) => f.key === filterRaw) ? filterRaw! : "all";

  const products = await prisma.product.findMany({
    where: { isDeleted: false, ...buildFilterWhere(filter) },
    orderBy: { processDueDate: { sort: "asc", nulls: "last" } },
    include: { site: true, processes: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <AppHeader title="納期順" subtitle="進行状況" />
      <div className="wrap">
        <div className="sorter">
          <Link href="/sites">現場順</Link>
          <span className="on" style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
            納期順
          </span>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/products" : `/products?filter=${f.key}`}
              className={f.key === filter ? "on" : ""}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <p className="sub" style={{ marginTop: 16 }}>
            該当する製品がありません。
          </p>
        )}

        {products.map((product) => (
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
              {product.processDueDate && (
                <div
                  className={`due${isNear(product.processDueDate, DAYS_BEFORE_NEAR) ? " near" : ""}`}
                >
                  {fmtDate(product.processDueDate)} 加工
                </div>
              )}
            </div>
            <div className="chips">
              {product.materialStatus === "未発注" && (
                <span className="chip alert">材料 未発注</span>
              )}
              {product.vendorSendDate && !product.vendorReturnActual && (
                <span className="chip alert">外注 戻り待ち</span>
              )}
              <span className="chip">{product.status}</span>
            </div>
            <ProgressMeter processes={product.processes} compact />
          </Link>
        ))}
      </div>
    </div>
  );
}
