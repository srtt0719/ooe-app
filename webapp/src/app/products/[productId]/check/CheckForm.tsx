"use client";

import { useState } from "react";
import { submitCheck } from "./actions";

type Item = { itemId: number; itemName: string; hint: string | null };

export function CheckForm({
  productId,
  items,
  defaultCheckerName,
  notifyReady,
}: {
  productId: number;
  items: Item[];
  defaultCheckerName: string;
  notifyReady: boolean;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [checkerName, setCheckerName] = useState(defaultCheckerName);
  const bound = submitCheck.bind(null, productId);

  function toggle(itemId: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const itemsJson = JSON.stringify(items.map((i) => ({ id: i.itemId, name: i.itemName })));

  return (
    <form action={bound}>
      <input type="hidden" name="itemsJson" value={itemsJson} />
      {items.map((item) => (
        <input
          key={item.itemId}
          type="hidden"
          name={`checked_${item.itemId}`}
          value={checked.has(item.itemId) ? "on" : ""}
        />
      ))}

      <div className="card">
        {items.map((item) => (
          <div className="chk" key={item.itemId}>
            <div
              className={`box${checked.has(item.itemId) ? " on" : ""}`}
              onClick={() => toggle(item.itemId)}
            >
              {checked.has(item.itemId) && "✓"}
            </div>
            <div className="ctext">
              {item.itemName}
              {item.hint && <div className="chint">{item.hint}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="fld">
        <label htmlFor="checkerName">チェック者</label>
        <input
          className="inp"
          id="checkerName"
          name="checkerName"
          value={checkerName}
          onChange={(e) => setCheckerName(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      <button className="btn wide" type="submit" disabled={!checkerName.trim()}>
        チェック完了
      </button>
      <div className="sendto">
        {notifyReady ? "送信先：設定済みのグループ・担当者" : "通知先が未設定です（設定 → LINE WORKS 通知先）"}
      </div>

      <div className="note">
        送信すると、この製品は納期順の一覧から外れて作業終了リストへ移ります。
        <br />
        通知先が設定されていれば、LINE WORKSへ自動で送信されます。通知が届かない場合もチェックの記録は保存されます。
      </div>
    </form>
  );
}
