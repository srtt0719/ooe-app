import { prisma } from "@/lib/prisma";
import { RegisterForm } from "./RegisterForm";
import { AppHeader } from "@/components/AppHeader";

export default async function RegisterPage() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { userName: "asc" },
    select: { userId: true, userName: true },
  });

  return (
    <div>
      <AppHeader title="新規登録" subtitle="現場と製品をまとめて登録" />
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          図面から読み取って登録する機能はフェーズ5で追加します。現在は手入力のみです。
          既存の現場に製品を追加したい場合は、現場ページの「＋ 製品を登録」から行えます。
        </div>
        <RegisterForm users={users} />
      </div>
    </div>
  );
}
