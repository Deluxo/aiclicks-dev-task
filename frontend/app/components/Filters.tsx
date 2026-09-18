import type { ChangeEvent } from "react";
import type { MentionFilters } from "@/lib/types";
import { Button, Card, FieldLabel, Input, LabelText, Select } from "./atoms";

interface FiltersProps {
  filters: MentionFilters;
  onChange: (filters: MentionFilters) => void;
}

const MODELS = ["chatgpt", "claude", "gemini", "perplexity"] as const;
const SENTIMENTS = ["positive", "neutral", "negative"] as const;

export function Filters({ filters, onChange }: FiltersProps) {
  const update = (key: keyof MentionFilters, value: string | undefined) => {
    const next = { ...filters } as Partial<MentionFilters>;
    if (value === undefined) delete next[key];
    else (next as Record<string, unknown>)[key] = value;
    onChange(next);
  };

  return (
    <Card className="flex flex-wrap items-end gap-3 p-4">
      <FieldLabel>
        <LabelText>Model</LabelText>
        <Select
          value={filters.model ?? ""}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => update("model", e.target.value || undefined)}
        >
          <option value="">All models</option>
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </FieldLabel>

      <FieldLabel>
        <LabelText>Sentiment</LabelText>
        <Select
          value={filters.sentiment ?? ""}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => update("sentiment", e.target.value || undefined)}
        >
          <option value="">All sentiments</option>
          {SENTIMENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </FieldLabel>

      <FieldLabel>
        <LabelText>From</LabelText>
        <Input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => update("date_from", e.target.value || undefined)}
        />
      </FieldLabel>

      <FieldLabel>
        <LabelText>To</LabelText>
        <Input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => update("date_to", e.target.value || undefined)}
        />
      </FieldLabel>

      <Button onClick={() => onChange({})} disabled={Object.keys(filters).length === 0} className="h-9">
        Reset
      </Button>
    </Card>
  );
}
