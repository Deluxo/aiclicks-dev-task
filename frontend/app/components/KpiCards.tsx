import { Card, KpiGrid, KpiValue, MutedText, Skeleton } from "./atoms";

interface KpiCardsProps {
  totalMentions: number | null;
  trendTotals: { total: number; mentioned: number } | null;
  loading: boolean;
}

export function KpiCards({ totalMentions, trendTotals, loading }: KpiCardsProps) {
  const mentioned = trendTotals?.mentioned ?? null;
  const rate =
    trendTotals && trendTotals.total > 0
      ? ((trendTotals.mentioned / trendTotals.total) * 100).toFixed(1) + "%"
      : null;

  return (
    <KpiGrid>
      <KpiCard label="Total Mentions" value={totalMentions} loading={loading} />
      <KpiCard label="Brand Mentioned" value={mentioned} loading={loading} />
      <KpiCard label="Mention Rate" value={rate} loading={loading} />
    </KpiGrid>
  );
}

function KpiCard({ label, value, loading }: { label: string; value: number | string | null; loading: boolean }) {
  return (
    <Card className="p-5">
      <MutedText>{label}</MutedText>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <KpiValue>{value ?? "—"}</KpiValue>
      )}
    </Card>
  );
}
