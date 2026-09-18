"use client";

import { useEffect, useMemo, useState } from "react";
import { Filters } from "./components/Filters";
import { Header } from "./components/Header";
import { KpiCards } from "./components/KpiCards";
import { MentionsTable } from "./components/MentionsTable";
import { TrendChart } from "./components/TrendChart";
import { ActionButton, Alert, Container, Page } from "./components/atoms";
import { fetchMentions, fetchTrends } from "../lib/api";
import type { MentionFilters, MentionsResponse, TrendPoint } from "../lib/types";

const PER_PAGE = 25;

export default function Dashboard() {
  const [filters, setFilters] = useState<MentionFilters>({});
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState<"day" | "week">("day");
  const [mentions, setMentions] = useState<MentionsResponse | null>(null);
  const [trends, setTrends] = useState<TrendPoint[] | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTable(true);
    fetchMentions({ page, per_page: PER_PAGE, filters }, controller.signal)
      .then((res) => {
        setMentions(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(message(err));
      })
      .finally(() => setLoadingTable(false));
    return () => controller.abort();
  }, [page, filters, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingChart(true);
    fetchTrends({ ...filters, group_by: groupBy }, controller.signal)
      .then((res) => setTrends(res.data))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(message(err));
      })
      .finally(() => setLoadingChart(false));
    return () => controller.abort();
  }, [filters, groupBy, refreshKey]);

  const handleFilterChange = (next: MentionFilters) => {
    setPage(1);
    setFilters(next);
  };

  const trendTotals = useMemo(
    () =>
      trends
        ? trends.reduce((acc, p) => ({ total: acc.total + p.total, mentioned: acc.mentioned + p.mentioned }), { total: 0, mentioned: 0 })
        : null,
    [trends],
  );

  return (
    <Page>
      <Container>
        <Header />

        {error && (
          <Alert>
            <span>{error}</span>
            <ActionButton onClick={() => setRefreshKey((k) => k + 1)}>Try again</ActionButton>
          </Alert>
        )}

        <KpiCards totalMentions={mentions?.total ?? null} trendTotals={trendTotals} loading={loadingTable || loadingChart} />

        <TrendChart data={trends} groupBy={groupBy} onGroupByChange={setGroupBy} loading={loadingChart} />

        <Filters filters={filters} onChange={handleFilterChange} />

        <MentionsTable
          data={mentions?.data ?? null}
          loading={loadingTable}
          total={mentions?.total ?? 0}
          page={page}
          perPage={PER_PAGE}
          onPageChange={setPage}
          onResetFilters={() => handleFilterChange({})}
        />
      </Container>
    </Page>
  );
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
