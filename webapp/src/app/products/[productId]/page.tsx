import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";
import { ProgressMeter } from "@/components/ProgressMeter";
import { ProcessRow } from "@/components/ProcessRow";
import { buildAlertInfo } from "@/lib/processAlert";
import { getTemplatesWithProcesses } from "@/lib/processTemplates";
import { applyTemplateToProduct, currentUserName } from "../processActions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: productIdStr } = await params;
  const productId = Number(productIdStr);

  const product = await prisma.product.findUnique({
    where: { productId },
    include: {
      site: true,
      processes: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || product.isDeleted) notFound();

  const templateAlerts = await prisma.processTemplate.findMany({
    select: { processName: true, alertMessage: true },
  });
  const alertByName = new Map(templateAlerts.map((t) => [t.processName, t.alertMessage]));

  const total = product.processes.reduce((s, p) => s + p.weight, 0);
  const done = product.processes
    .filter((p) => p.isCompleted)
    .reduce((s, p) => s + p.weight, 0);
  const allCompleted = product.processes.length > 0 && done === total;

  const templates = product.processes.length === 0 ? await getTemplatesWithProcesses() : [];
  const boundApplyTemplate = applyTemplateToProduct.bind(null, productId);
  const defaultUserName = await currentUserName();

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

          {product.processes.length > 0 && <ProgressMeter processes={product.processes} />}

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

        <div className="eyebrow">工程</div>

        {product.processes.length === 0 ? (
          <div className="card">
            <p className="sub" style={{ marginTop: 0 }}>
              この製品にはまだ工程が設定されていません。
            </p>
            {templates.length > 0 && (
              <form action={boundApplyTemplate}>
                <div className="fld">
                  <label htmlFor="templateName">テンプレート</label>
                  <select className="inp" id="templateName" name="templateName" defaultValue={templates[0].templateName}>
                    {templates.map((t) => (
                      <option key={t.templateName} value={t.templateName}>
                        {t.templateName}（{t.processes.length}工程）
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn wide" type="submit">
                  工程を設定する
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="card">
            {product.processes.map((process) => (
              <ProcessRow
                key={process.processId}
                process={process}
                productId={productId}
                defaultUserName={defaultUserName}
                alertInfo={buildAlertInfo(
                  process.processName,
                  alertByName.get(process.processName) ?? null,
                  {
                    material: product.material,
                    thickness: product.thickness,
                    drawingNumber: product.drawingNumber,
                    finish: product.finish,
                  },
                )}
              />
            ))}
          </div>
        )}

        <button className="btn wide" disabled>
          {allCompleted
            ? "完成チェックへ（フェーズ4で追加）"
            : "完成チェックへ（全工程完了後）"}
        </button>

        <div className="note">数値は入力しません。着手と完了のボタンだけで進捗が動きます。</div>
      </div>
    </div>
  );
}
