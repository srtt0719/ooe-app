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
      desc: "図面を取り込む ／ 現場・製品を登録する",
    },
    {
      no: "02",
      title: "全現場・製品",
      desc: "現場名・製品名・注番から図面を開く",
      badge: siteCount,
    },
    {
      no: "03",
      title: "納期順",
      desc: "製作の進行具合を確認する",
      badge: productCount,
    },
    {
      no: "04",
      title: "作業終了リスト",
      desc: "チェック・送信が済んだ製品",
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

        {menuItems.map((m) => (
          <div className="menu" key={m.no}>
            <div className="mno">{m.no}</div>
            <div className="mtxt">
              <b>{m.title}</b>
              <span>{m.desc}</span>
            </div>
            {m.badge !== undefined && (
              <div className={`mbadge${m.quiet ? " quiet" : ""}`}>{m.badge}</div>
            )}
          </div>
        ))}

        <div className="note">
          フェーズ1では、データベースへの接続とログインまでを確認しています。
          現場・製品の登録や一覧表示はフェーズ2で実装します。
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
