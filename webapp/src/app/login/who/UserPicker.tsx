"use client";

import { useActionState } from "react";
import { pickUser, addUserAndLogin } from "../actions";

type ActiveUser = { userId: number; userName: string };

export function UserPicker({ users }: { users: ActiveUser[] }) {
  const [pickState, pickAction, pickPending] = useActionState(pickUser, { error: "" });
  const [addState, addAction, addPending] = useActionState(addUserAndLogin, { error: "" });

  return (
    <div>
      {users.map((u) => (
        <form action={pickAction} key={u.userId}>
          <input type="hidden" name="userId" value={u.userId} />
          <button className="picker" type="submit" disabled={pickPending}>
            {u.userName}
          </button>
        </form>
      ))}
      {pickState.error && <p className="errtext">{pickState.error}</p>}

      <div className="eyebrow">名前が一覧にない場合</div>
      <form action={addAction} className="card">
        <div className="fld">
          <label htmlFor="userName">名前を入力して追加</label>
          <input className="inp" id="userName" name="userName" required />
        </div>
        {addState.error && <p className="errtext">{addState.error}</p>}
        <button className="btn wide" type="submit" disabled={addPending}>
          {addPending ? "追加中…" : "追加してログイン"}
        </button>
      </form>
    </div>
  );
}
