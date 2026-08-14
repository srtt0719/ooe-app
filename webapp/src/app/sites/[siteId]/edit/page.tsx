import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteForm } from "../../SiteForm";
import { updateSite, deleteSite } from "../../actions";
import { DeleteSection } from "@/components/DeleteSection";
import { AppHeader } from "@/components/AppHeader";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId: siteIdStr } = await params;
  const siteId = Number(siteIdStr);

  const [site, users, productCount, fileCount] = await Promise.all([
    prisma.site.findUnique({ where: { siteId } }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { userName: "asc" },
      select: { userId: true, userName: true },
    }),
    prisma.product.count({ where: { siteId, isDeleted: false } }),
    prisma.file.count({ where: { siteId } }),
  ]);

  if (!site || site.isDeleted) notFound();

  const boundUpdate = updateSite.bind(null, siteId);
  const boundDelete = deleteSite.bind(null, siteId);

  const impactParts = [`製品 ${productCount}件`];
  if (fileCount > 0) impactParts.push(`添付ファイル ${fileCount}件`);

  return (
    <div>
      <AppHeader title="現場を編集" subtitle={site.siteName} backHref={`/sites/${siteId}`} />
      <div className="wrap">
        <SiteForm
          action={boundUpdate}
          users={users}
          submitLabel="変更を保存"
          showStatus
          initial={{
            siteName: site.siteName,
            clientName: site.clientName ?? "",
            orderNumber: site.orderNumber ?? "",
            deliveryDueDate: site.deliveryDueDate,
            managerUserId: site.managerUserId,
            siteAddress: site.siteAddress ?? "",
            note: site.note ?? "",
            status: site.status ?? "進行中",
          }}
        />
        <DeleteSection
          label="この現場"
          impactText={`${impactParts.join("・")}も一覧に表示されなくなります。`}
          action={boundDelete}
        />
      </div>
    </div>
  );
}
