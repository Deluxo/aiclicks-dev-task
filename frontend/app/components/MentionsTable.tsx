import type { ReactNode } from "react";
import type { Mention } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  CheckMark,
  Dash,
  LabelText,
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

const FIELDS: { label: string; render: (m: Mention) => ReactNode }[] = [
  {
    label: "Model",
    render: (m) => <Badge className={MODEL_BADGES[m.model] ?? "bg-gray-100 text-gray-600"}>{m.model}</Badge>,
  },
  {
    label: "Mentioned",
    render: (m) => (m.mentioned ? <CheckMark /> : <Dash />),
  },
  {
    label: "Position",
    render: (m) => <span className="text-gray-500">{m.position ? `#${m.position}` : "—"}</span>,
  },
  {
    label: "Sentiment",
    render: (m) =>
      m.sentiment ? (
        <Badge className={SENTIMENT_PILLS[m.sentiment] ?? "bg-gray-100 text-gray-600"}>{m.sentiment}</Badge>
      ) : (
        <Dash />
      ),
  },
];

function Citation({ m, linkClassName }: { m: Mention; linkClassName?: string }) {
  return m.citation_url ? (
    <Link href={m.citation_url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {m.citation_url.replace(/^https?:\/\//, "")}
    </Link>
  ) : (
    <Dash />
  );
}

function FieldItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <LabelText>{label}</LabelText>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function MentionsTable({ data, loading, total, page, perPage, onPageChange, onResetFilters }: MentionsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <Card>
      {loading || data === null ? (
        <>
          <div className="divide-y divide-gray-100 sm:hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-3.5 w-3/4" />
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {Array.from({ length: 4 }, (_, j) => (
                    <Skeleton key={j} className="h-3.5 w-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <Table>
              <tbody>
                {Array.from({ length: 8 }, (_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-3.5" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      ) : data.length === 0 ? (
        <div className="py-12 text-center">
          <MutedText>No mentions match your filters.</MutedText>
          <Button
            onClick={onResetFilters}
            className="mt-3 border-transparent bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100 sm:hidden">
            {data.map((m) => (
              <div key={m.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{m.query_text}</p>
                  <span className="shrink-0 text-xs text-gray-500">{m.created_at.slice(0, 10)}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {FIELDS.map((f) => (
                    <FieldItem key={f.label} label={f.label}>
                      {f.render(m)}
                    </FieldItem>
                  ))}
                </dl>
                <div className="mt-3 text-sm">
                  <LabelText>Citation</LabelText>
                  <div className="mt-1">
                    <Citation m={m} linkClassName="break-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <thead>
                <TableHeadRow>
                  <TableHeadCell>Query</TableHeadCell>
                  {FIELDS.map((f) => (
                    <TableHeadCell key={f.label}>{f.label}</TableHeadCell>
                  ))}
                  <TableHeadCell>Citation</TableHeadCell>
                  <TableHeadCell>Date</TableHeadCell>
                </TableHeadRow>
              </thead>
              <tbody>
                {data.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="max-w-[32ch] truncate text-gray-900">{m.query_text}</TableCell>
                    {FIELDS.map((f) => (
                      <TableCell key={f.label}>{f.render(m)}</TableCell>
                    ))}
                    <TableCell className="max-w-[28ch] truncate">
                      <Citation m={m} />
                    </TableCell>
                    <TableCell className="text-gray-500">{m.created_at.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

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
