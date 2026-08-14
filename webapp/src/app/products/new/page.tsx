import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";

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

  return (
    <div>
      <div className="head">
        <Link className="btn ghost" href={backHref} style={{ color: "#fff", padding: "0 2px" }}>
          ‹
        </Link>
        <h1>
          製品を登録
          <div className="hsub">{site ? site.siteName : "新規"}</div>
        </h1>
      </div>
      <div className="wrap">
        <ProductForm
          action={createProduct}
          siteContext={site ?? undefined}
          sitesForPicker={sitesForPicker}
          submitLabel="製品を登録"
        />
      </div>
    </div>
  );
}
