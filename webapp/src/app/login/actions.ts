"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, isPasswordVerified, markPasswordVerified } from "@/lib/session";

export type FormState = { error: string };

export async function submitPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.SHARED_LOGIN_PASSWORD ?? "";

  if (!expected || password !== expected) {
    return { error: "パスワードが違います" };
  }

  await markPasswordVerified();
  redirect("/login/who");
}

export async function pickUser(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isPasswordVerified())) {
    redirect("/login");
  }

  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(userId)) {
    return { error: "利用者を選んでください" };
  }

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user || !user.isActive) {
    return { error: "選択できませんでした" };
  }

  await createSession(user.userId);
  redirect("/");
}

export async function addUserAndLogin(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isPasswordVerified())) {
    redirect("/login");
  }

  const userName = String(formData.get("userName") ?? "").trim();
  if (!userName) {
    return { error: "名前を入力してください" };
  }

  const user = await prisma.user.create({ data: { userName } });
  await createSession(user.userId);
  redirect("/");
}
