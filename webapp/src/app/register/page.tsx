import Link from "next/link";

export default function RegisterPage() {
  return (
    <div>
      <div className="head">
        <Link className="btn ghost" href="/" style={{ color: "#fff", padding: "0 2px" }}>
          ‹
        </Link>
        <h1>
          新規登録
          <div className="hsub">手で登録</div>
        </h1>
      </div>
      <div className="wrap">
        <div className="note" style={{ marginTop: 0 }}>
          図面から読み取って登録する機能はフェーズ5で追加します。現在は手入力での登録のみです。
        </div>

        <div className="eyebrow">現場・製品の登録</div>
        <Link className="add" href="/sites/new">
          ＋ 現場を登録
        </Link>
        <Link className="add" href="/products/new">
          ＋ 製品を登録
        </Link>
      </div>
    </div>
  );
}
