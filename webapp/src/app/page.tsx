import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { logout } from "./logout-action";

export default async function MenuPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) {
    redirect("/login");
  }

  const [siteCount, productCount, finishedCount] = await Promise.all([
    prisma.site.count({ where: { isDeleted: false } }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.count({
      where: { isDeleted: false, status: { in: ["完了", "出荷済"] } },
    }),
  ]);

  const menuItems = [
    {
      no: "01",
      title: "新規登録",
      desc: "現場・製品を登録する",
      href: "/register",
    },
    {
      no: "02",
      title: "全現場・製品",
      desc: "現場名・客先・注番から探す",
      href: "/sites",
      badge: siteCount,
    },
    {
      no: "03",
      title: "納期順",
      desc: "製作の進行具合を確認する",
      href: "/products",
      badge: productCount,
    },
    {
      no: "04",
      title: "作業終了リスト",
      desc: "チェック・送信が済んだ製品（フェーズ4）",
      href: null,
      badge: finishedCount,
      quiet: true,
    },
  ];

  return (
    <div>
      <div className="head">
        <h1>
          製作・現場管理
          <div className="hsub">大栄製作所</div>
        </h1>
      </div>

      <div className="wrap">
        <div className="eyebrow">ログイン中: {user.userName}</div>

        {menuItems.map((m) => {
          const content = (
            <>
              <div className="mno">{m.no}</div>
              <div className="mtxt">
                <b>{m.title}</b>
                <span>{m.desc}</span>
              </div>
              {m.badge !== undefined && (
                <div className={`mbadge${m.quiet ? " quiet" : ""}`}>{m.badge}</div>
              )}
            </>
          );
          return m.href ? (
            <Link className="menu" href={m.href} key={m.no}>
              {content}
            </Link>
          ) : (
            <div className="menu" style={{ opacity: 0.55 }} key={m.no}>
              {content}
            </div>
          );
        })}

        <div className="note">
          作業終了リスト・工程の進捗管理・完成チェックは次のフェーズで追加します。
        </div>

        <form action={logout}>
          <button className="btn ghost wide" type="submit">
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
