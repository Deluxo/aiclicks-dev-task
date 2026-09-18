import type { ReactNode } from "react";
import type { Mention } from "@/lib/types";
import { atom } from "@synergyeffect/react-atom";
import { Button, CheckMark, Dash, Link, MutedText, Pill } from "./atoms";
import { Table } from "./Table";
import type { Columns } from "./Table";

interface MentionsTableProps {
  data: Mention[] | null;
  loading: boolean;
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

const ChatGptPill = atom(<Pill className="bg-emerald-100 text-emerald-700" />);
const ClaudePill = atom(<Pill className="bg-amber-100 text-amber-700" />);
const GeminiPill = atom(<Pill className="bg-blue-100 text-blue-700" />);
const PerplexityPill = atom(<Pill className="bg-violet-100 text-violet-700" />);

const PositiveSentimentPill = atom(<Pill className="bg-emerald-100 text-emerald-700" />);
const NeutralSentimentPill = atom(<Pill className="bg-slate-100 text-slate-600" />);
const NegativeSentimentPill = atom(<Pill className="bg-rose-100 text-rose-700" />);

const DefaultPill = atom(<Pill className="bg-gray-100 text-gray-600" />);

const MODEL_PILLS: Record<string, typeof ChatGptPill> = {
  chatgpt: ChatGptPill,
  claude: ClaudePill,
  gemini: GeminiPill,
  perplexity: PerplexityPill,
};

const SENTIMENT_PILLS: Record<string, typeof PositiveSentimentPill> = {
  positive: PositiveSentimentPill,
  neutral: NeutralSentimentPill,
  negative: NegativeSentimentPill,
};

function getModelPill(model: string): ReactNode {
  const P = MODEL_PILLS[model] ?? DefaultPill;
  return <P>{model}</P>;
}

function getSentimentPill(sentiment: string | null): ReactNode {
  if (!sentiment) return <Dash />;
  const S = SENTIMENT_PILLS[sentiment] ?? DefaultPill;
  return <S>{sentiment}</S>;
}

const COLUMNS: Columns<Mention> = {
  query: [() => "Query", (m) => <span className="block max-w-[32ch] truncate text-gray-900">{m.query_text}</span>],
  model: [() => "Model", (m) => getModelPill(m.model)],
  mentioned: [() => "Mentioned", (m) => (m.mentioned ? <CheckMark /> : <Dash />)],
  position: [() => "Position", (m) => <span className="text-gray-500">{m.position ? `#${m.position}` : "—"}</span>],
  sentiment: [() => "Sentiment", (m) => getSentimentPill(m.sentiment)],
  citation: [
    () => "Citation",
    (m) =>
      m.citation_url ? (
        <span className="block max-w-[28ch] truncate">
          <Link href={m.citation_url} target="_blank" rel="noopener noreferrer">
            {m.citation_url.replace(/^https?:\/\//, "")}
          </Link>
        </span>
      ) : (
        <Dash />
      ),
  ],
  date: [() => "Date", (m) => <span className="text-gray-500">{m.created_at.slice(0, 10)}</span>],
};

export function MentionsTable({ data, loading, total, page, perPage, onPageChange, onResetFilters }: MentionsTableProps) {
  return (
    <Table
      columns={COLUMNS}
      rows={data}
      rowKey={(m) => m.id}
      loading={loading}
      emptyState={
        <>
          <MutedText>No mentions match your filters.</MutedText>
          <Button
            onClick={onResetFilters}
            className="mt-3 border-transparent bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Reset filters
          </Button>
        </>
      }
      pagination={{ page, total, perPage, onPageChange }}
    />
  );
}
