import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../ProductForm";
import { updateProduct, deleteProduct } from "../../actions";
import { DeleteSection } from "@/components/DeleteSection";
import { AppHeader } from "@/components/AppHeader";
import { getSettingJsonArray, SETTING_KEYS, DEFAULT_MATERIAL_OPTIONS, DEFAULT_FINISH_OPTIONS } from "@/lib/settings";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: productIdStr } = await params;
  const productId = Number(productIdStr);

  const [product, processCount, checkRecordCount, fileCount, materialOptions, finishOptions, vendorNames] =
    await Promise.all([
      prisma.product.findUnique({ where: { productId }, include: { site: true } }),
      prisma.process.count({ where: { productId } }),
      prisma.checkRecord.count({ where: { productId } }),
      prisma.file.count({ where: { productId } }),
      getSettingJsonArray(SETTING_KEYS.materialOptions, DEFAULT_MATERIAL_OPTIONS),
      getSettingJsonArray(SETTING_KEYS.finishOptions, DEFAULT_FINISH_OPTIONS),
      getSettingJsonArray(SETTING_KEYS.vendorNames, []),
    ]);

  if (!product || product.isDeleted) notFound();

  const boundUpdate = updateProduct.bind(null, productId);
  const boundDelete = deleteProduct.bind(null, productId);

  const impactParts: string[] = [];
  if (processCount > 0) impactParts.push(`工程の記録 ${processCount}件`);
  if (checkRecordCount > 0) impactParts.push(`チェック記録 ${checkRecordCount}件`);
  if (fileCount > 0) impactParts.push(`添付ファイル ${fileCount}件`);
  const impactText =
    impactParts.length > 0
      ? `${impactParts.join("・")}も一覧に表示されなくなります。`
      : "この製品が一覧に表示されなくなります。";

  return (
    <div>
      <AppHeader
        title="製品を編集"
        subtitle={product.productName}
        backHref={`/products/${productId}`}
      />
      <div className="wrap">
        <ProductForm
          action={boundUpdate}
          siteContext={{
            siteId: product.site.siteId,
            siteName: product.site.siteName,
            orderNumber: product.site.orderNumber,
          }}
          materialOptions={materialOptions}
          finishOptions={finishOptions}
          vendorNames={vendorNames}
          submitLabel="変更を保存"
          showStatusAndActualReturn
          initial={{
            productName: product.productName,
            orderNumber: product.orderNumber ?? "",
            quantity: product.quantity ? String(product.quantity) : "",
            material: product.material ?? "",
            thickness: product.thickness ?? "",
            finish: product.finish ?? "",
            drawingNumber: product.drawingNumber ?? "",
            processDueDate: product.processDueDate,
            deliveryDate: product.deliveryDate,
            materialStatus: product.materialStatus ?? "未発注",
            materialArrivalDate: product.materialArrivalDate,
            surfaceType: product.surfaceType ?? "自社",
            vendorName: product.vendorName ?? "",
            vendorSendDate: product.vendorSendDate,
            vendorReturnPlanned: product.vendorReturnPlanned,
            vendorReturnActual: product.vendorReturnActual,
            status: product.status,
            note: product.note ?? "",
          }}
        />
        <DeleteSection label="この製品" impactText={impactText} action={boundDelete} />
      </div>
    </div>
  );
}
