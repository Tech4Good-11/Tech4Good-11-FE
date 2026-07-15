import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * 도넛 차트 — 상태 분포 등. 중앙에 핵심 숫자.
 * 세그먼트 사이 2px 흰 간격(paddingAngle+stroke).
 */
export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 160,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel?: string;
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={total > 0 ? segments : [{ label: "-", value: 1, color: "#E5E8EB" }]}
            dataKey="value"
            innerRadius={size * 0.34}
            outerRadius={size * 0.5}
            paddingAngle={total > 1 ? 2 : 0}
            startAngle={90}
            endAngle={-270}
            stroke="#fff"
            strokeWidth={2}
          >
            {(total > 0 ? segments : [{ color: "#E5E8EB" }]).map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* 중앙 라벨 */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-data-lg font-bold tabular-nums text-gray-900">{centerValue}</span>
        {centerLabel && <span className="text-caption text-gray-400">{centerLabel}</span>}
      </div>
    </div>
  );
}
