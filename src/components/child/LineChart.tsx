import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface LinePoint {
  label: string; // "7/9"
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
  unit?: string;
}

function ChartTooltip({ active, payload, label, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-input bg-white px-3 py-2 shadow-card-hover">
      <p className="text-caption text-gray-400">{label}</p>
      <p className="text-body font-bold text-gray-900">
        {payload[0].value}
        {unit ? <span className="ml-0.5 text-caption font-normal text-gray-400">{unit}</span> : null}
      </p>
    </div>
  );
}

/**
 * 건강 지표 추이 라인차트 (단일 시계열).
 * 단일 hue(primary) · 2px 선 · recessive 축/그리드 · 툴팁.
 */
export function LineChart({
  data,
  unit,
  color = "#3182F6",
  height = 200,
}: {
  data: LinePoint[];
  unit?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} stroke="#F2F4F6" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#B0B8C1" }}
          dy={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fontSize: 12, fill: "#B0B8C1" }}
          tickCount={4}
          domain={["dataMin - 5", "dataMax + 5"]}
        />
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: "#D1D6DB", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
}
