import type { Mention } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  CheckMark,
  Dash,
  Link,
  MutedText,
  Skeleton,
  Table,
  TableCell,
  TableFooter,
  TableHeadCell,
  TableHeadRow,
  TableRow,
} from "./atoms";

interface MentionsTableProps {
  data: Mention[] | null;
  loading: boolean;
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

const MODEL_BADGES: Record<string, string> = {
  chatgpt: "bg-emerald-100 text-emerald-700",
  claude: "bg-amber-100 text-amber-700",
  gemini: "bg-blue-100 text-blue-700",
  perplexity: "bg-violet-100 text-violet-700",
};

const SENTIMENT_PILLS: Record<string, string> = {
  positive: "bg-emerald-100 text-emerald-700",
  neutral: "bg-slate-100 text-slate-600",
  negative: "bg-rose-100 text-rose-700",
};

export function MentionsTable({ data, loading, total, page, perPage, onPageChange, onResetFilters }: MentionsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <Card>
      <Table>
        <thead>
          <TableHeadRow>
            <TableHeadCell>Query</TableHeadCell>
            <TableHeadCell>Model</TableHeadCell>
            <TableHeadCell>Mentioned</TableHeadCell>
            <TableHeadCell>Position</TableHeadCell>
            <TableHeadCell>Sentiment</TableHeadCell>
            <TableHeadCell>Citation</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
          </TableHeadRow>
        </thead>
        <tbody>
          {loading || data === null ? (
            Array.from({ length: 8 }, (_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }, (_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-3.5" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center">
                <MutedText>No mentions match your filters.</MutedText>
                <Button
                  onClick={onResetFilters}
                  className="mt-3 border-transparent bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  Reset filters
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            data.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="max-w-[32ch] truncate text-gray-900">{m.query_text}</TableCell>
                <TableCell>
                  <Badge className={MODEL_BADGES[m.model] ?? "bg-gray-100 text-gray-600"}>{m.model}</Badge>
                </TableCell>
                <TableCell>
                  {m.mentioned ? (
                    <CheckMark />
                  ) : (
                    <Dash />
                  )}
                </TableCell>
                <TableCell className="text-gray-500">{m.position ? `#${m.position}` : "—"}</TableCell>
                <TableCell>
                  {m.sentiment ? (
                    <Badge className={SENTIMENT_PILLS[m.sentiment] ?? "bg-gray-100 text-gray-600"}>{m.sentiment}</Badge>
                  ) : (
                    <Dash />
                  )}
                </TableCell>
                <TableCell className="max-w-[28ch] truncate">
                  {m.citation_url ? (
                    <Link href={m.citation_url} target="_blank" rel="noopener noreferrer">
                      {m.citation_url.replace(/^https?:\/\//, "")}
                    </Link>
                  ) : (
                    <Dash />
                  )}
                </TableCell>
                <TableCell className="text-gray-500">{m.created_at.slice(0, 10)}</TableCell>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      {!loading && data !== null && total > 0 && (
        <TableFooter>
          <MutedText>
            Showing {from}–{to} of {total.toLocaleString()}
          </MutedText>
          <div className="flex gap-2">
            <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              Prev
            </Button>
            <Button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </TableFooter>
      )}
    </Card>
  );
}
