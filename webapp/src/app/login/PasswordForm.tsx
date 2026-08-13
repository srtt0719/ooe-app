"use client";

import { useActionState } from "react";
import { submitPassword } from "./actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(submitPassword, { error: "" });

  return (
    <form action={action}>
      <div className="fld">
        <label htmlFor="password">共通パスワード</label>
        <input
          className="inp"
          id="password"
          name="password"
          type="password"
          autoFocus
          required
        />
      </div>
      {state.error && <p className="errtext">{state.error}</p>}
      <button className="btn wide" type="submit" disabled={pending}>
        {pending ? "確認中…" : "次へ"}
      </button>
    </form>
  );
}
