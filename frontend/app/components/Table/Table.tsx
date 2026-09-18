import type { ReactNode } from "react";
import { Button, Card, LabelText, MutedText, Skeleton } from "../atoms";

export type Columns<T> = Record<string, [(item: T) => ReactNode, (item: T) => ReactNode]>;

interface TableProps<T> {
  columns: Columns<T>;
  rows: T[] | null;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;
  pagination?: { page: number; total: number; perPage: number; onPageChange: (page: number) => void };
}

export function Table<T>({ columns, rows, rowKey, loading = false, emptyState, pagination }: TableProps<T>) {
  const keys = Object.keys(columns);
  const firstKey = keys[0];
  const restKeys = keys.slice(1);

  return (
    <Card>
      {loading || rows === null ? (
        <>
          <div className="divide-y divide-gray-100 sm:hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-3.5 w-3/4" />
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {restKeys.map((key) => (
                    <Skeleton key={key} className="h-3.5 w-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <tbody>
                {Array.from({ length: 8 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    {keys.map((key) => (
                      <td key={key} className="px-4 py-3">
                        <Skeleton className="h-3.5" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center">{emptyState}</div>
      ) : (
        <>
          <div className="divide-y divide-gray-100 sm:hidden">
            {rows.map((row) => (
              <div key={rowKey(row)} className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{columns[firstKey][1](row)}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {restKeys.map((key) => (
                    <div key={key}>
                      <LabelText>{columns[key][0](row)}</LabelText>
                      <div className="mt-1">{columns[key][1](row)}</div>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  {keys.map((key) => (
                    <th key={key} className="px-4 py-3 font-medium">
                      {columns[key][0](rows[0])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    {keys.map((key) => (
                      <td key={key} className="px-4 py-3">{columns[key][1](row)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination && !loading && rows !== null && pagination.total > 0 && (
        <TableFooter
          from={(pagination.page - 1) * pagination.perPage + 1}
          to={Math.min(pagination.page * pagination.perPage, pagination.total)}
          total={pagination.total}
          onPrev={() => pagination.onPageChange(pagination.page - 1)}
          onNext={() => pagination.onPageChange(pagination.page + 1)}
          canPrev={pagination.page > 1}
          canNext={pagination.page < Math.max(1, Math.ceil(pagination.total / pagination.perPage))}
        />
      )}
    </Card>
  );
}

function TableFooter({ from, to, total, onPrev, onNext, canPrev, canNext }: {
  from: number;
  to: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
      <MutedText>
        Showing {from}–{to} of {total.toLocaleString()}
      </MutedText>
      <div className="flex gap-2">
        <Button onClick={onPrev} disabled={!canPrev}>
          Prev
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
