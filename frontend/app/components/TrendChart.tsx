import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";
import { Card, EmptyState, SectionHeader, SectionTitle, SegmentedGroup, Skeleton, ToggleButton } from "./atoms";

interface TrendChartProps {
  data: TrendPoint[] | null;
  groupBy: "day" | "week";
  onGroupByChange: (groupBy: "day" | "week") => void;
  loading: boolean;
}

export function TrendChart({ data, groupBy, onGroupByChange, loading }: TrendChartProps) {
  return (
    <Card className="p-5">
      <SectionHeader>
        <SectionTitle>Mention Trends</SectionTitle>
        <SegmentedGroup>
          {(["day", "week"] as const).map((g) => (
            <ToggleButton
              key={g}
              onClick={() => onGroupByChange(g)}
              className={groupBy === g ? "bg-indigo-600 text-white" : undefined}
            >
              {g}
            </ToggleButton>
          ))}
        </SegmentedGroup>
      </SectionHeader>

      {loading ? (
        <Skeleton className="h-72" />
      ) : !data || data.length === 0 ? (
        <EmptyState>No mentions in this date range.</EmptyState>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} fontSize={12} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Total mentions"
              stroke="#9ca3af"
              strokeWidth={1.5}
              fill="#e5e7eb"
            />
            <Line type="monotone" dataKey="mentioned" name="Brand mentioned" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
