import Link from "next/link";

export function AppHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <div className="head">
      {backHref ? (
        <Link className="btn ghost" href={backHref} style={{ color: "#fff", padding: "0 2px" }}>
          ‹
        </Link>
      ) : (
        <span style={{ width: 19 }} />
      )}
      <h1>
        {title}
        {subtitle && <div className="hsub">{subtitle}</div>}
      </h1>
      <div style={{ display: "flex", gap: 4 }}>
        <Link
          className="btn ghost"
          href="/settings"
          aria-label="設定"
          style={{ color: "#fff", padding: "0 2px", fontSize: 16 }}
        >
          ⚙
        </Link>
        <Link
          className="btn ghost"
          href="/"
          aria-label="メニューに戻る"
          style={{ color: "#fff", padding: "0 2px", fontSize: 17 }}
        >
          ⌂
        </Link>
      </div>
    </div>
  );
}
