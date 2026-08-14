// 仕様書2-2: 進捗率はDBに保存せず、工程の完了weightから毎回算出する。
type MeterProcess = {
  processName: string;
  weight: number;
  isCompleted: boolean;
  startedAt: Date | null;
};

export function ProgressMeter({
  processes,
  compact,
}: {
  processes: MeterProcess[];
  compact?: boolean;
}) {
  if (processes.length === 0) {
    return <div className="sub" style={{ marginTop: 9 }}>工程未設定</div>;
  }

  const total = processes.reduce((s, p) => s + p.weight, 0) || 1;
  const done = processes.filter((p) => p.isCompleted).reduce((s, p) => s + p.weight, 0);
  const pct = Math.round((done / total) * 100);
  const current = processes.find((p) => !p.isCompleted && p.startedAt);

  return (
    <>
      <div className="meter">
        {processes.map((p) => (
          <div
            key={p.processName}
            className={`seg${p.isCompleted ? " done" : !p.isCompleted && p.startedAt ? " now" : ""}`}
            style={{ flex: p.weight }}
          >
            {!compact && <span>{p.processName}</span>}
          </div>
        ))}
      </div>
      <div className="mrow">
        <div className="pct">
          {pct}
          <small>%</small>
        </div>
        {current && <div className="now-label">{current.processName}中</div>}
      </div>
    </>
  );
}
