import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isPasswordVerified } from "@/lib/session";
import { UserPicker } from "./UserPicker";

export default async function WhoPage() {
  if (!(await isPasswordVerified())) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { userName: "asc" },
    select: { userId: true, userName: true },
  });

  return (
    <div className="center-wrap">
      <div className="center-card">
        <div className="brand">
          <b>あなたは誰ですか</b>
          <span>工程完了・チェック記録に使われます</span>
        </div>
        <UserPicker users={users} />
      </div>
    </div>
  );
}
