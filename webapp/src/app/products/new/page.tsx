import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";
import { AppHeader } from "@/components/AppHeader";
import { getTemplatesWithProcesses } from "@/lib/processTemplates";
import { getSettingJsonArray, SETTING_KEYS, DEFAULT_MATERIAL_OPTIONS, DEFAULT_FINISH_OPTIONS } from "@/lib/settings";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const { siteId: siteIdStr } = await searchParams;
  const siteId = siteIdStr ? Number(siteIdStr) : null;

  const site = siteId
    ? await prisma.site.findUnique({
        where: { siteId },
        select: { siteId: true, siteName: true, orderNumber: true },
      })
    : null;

  const sitesForPicker = site
    ? undefined
    : await prisma.site.findMany({
        where: { isDeleted: false },
        orderBy: { siteName: "asc" },
        select: { siteId: true, siteName: true },
      });

  const backHref = site ? `/sites/${site.siteId}` : "/register";
  const [templates, materialOptions, finishOptions, vendorNames] = await Promise.all([
    getTemplatesWithProcesses(),
    getSettingJsonArray(SETTING_KEYS.materialOptions, DEFAULT_MATERIAL_OPTIONS),
    getSettingJsonArray(SETTING_KEYS.finishOptions, DEFAULT_FINISH_OPTIONS),
    getSettingJsonArray(SETTING_KEYS.vendorNames, []),
  ]);

  return (
    <div>
      <AppHeader
        title="製品を登録"
        subtitle={site ? site.siteName : "新規"}
        backHref={backHref}
      />
      <div className="wrap">
        <ProductForm
          action={createProduct}
          siteContext={site ?? undefined}
          sitesForPicker={sitesForPicker}
          templates={templates}
          materialOptions={materialOptions}
          finishOptions={finishOptions}
          vendorNames={vendorNames}
          submitLabel="製品を登録"
        />
      </div>
    </div>
  );
}
