import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteForm } from "../SiteForm";
import { createSite } from "../actions";

export default async function NewSitePage() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { userName: "asc" },
    select: { userId: true, userName: true },
  });

  return (
    <div>
      <div className="head">
        <Link className="btn ghost" href="/sites" style={{ color: "#fff", padding: "0 2px" }}>
          ‹
        </Link>
        <h1>
          現場を登録
          <div className="hsub">新規</div>
        </h1>
      </div>
      <div className="wrap">
        <SiteForm action={createSite} users={users} submitLabel="現場を登録" />
        <div className="note">登録後、この現場の中に製品を追加していきます。</div>
      </div>
    </div>
  );
}
