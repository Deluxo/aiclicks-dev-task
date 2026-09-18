import { atom } from "@synergyeffect/react-atom";

export const Page = atom(<main className="min-h-screen bg-gray-50" />);
export const Container = atom(<div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8" />);
export const Card = atom(<div className="rounded-xl border border-gray-200 bg-white shadow-sm" />);
export const KpiGrid = atom(<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" />);
export const Alert = atom(
  <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
    <span>error</span>
  </div>,
);
export const PageTitle = atom(<h1 className="text-2xl font-bold text-gray-900" />);
export const SectionTitle = atom(<h2 className="text-base font-semibold text-gray-900" />);
export const MutedText = atom(<p className="text-sm text-gray-500">text</p>);
export const KpiValue = atom(<p className="mt-1 text-2xl font-semibold text-gray-900">value</p>);
export const FieldLabel = atom(<label className="flex flex-col gap-1" />);
export const LabelText = atom(<span className="text-xs font-medium text-gray-500">label</span>);
export const Select = atom(
  <select className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" />,
);
export const Input = atom(
  <input className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" />,
);
export const Button = atom(
  <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-40">
    label
  </button>,
);
export const ActionButton = atom(<button className="font-medium hover:underline">label</button>);
export const Skeleton = atom(<div className="animate-pulse rounded bg-gray-100" />);
export const Pill = atom(<span className="rounded-full px-2.5 py-1 text-xs font-medium">badge</span>);
export const Dash = atom(<span className="text-gray-400">—</span>);
export const CheckMark = atom(<span className="font-medium text-emerald-600">✓</span>);
export const Link = atom(<a className="text-indigo-600 hover:underline" />);
export const SectionHeader = atom(
  <div className="mb-4 flex items-center justify-between">
    <span>header</span>
  </div>,
);
export const SegmentedGroup = atom(
  <div className="flex rounded-lg border border-gray-200 p-0.5">
    <span>segment</span>
  </div>,
);
export const ToggleButton = atom(
  <button className="rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors text-gray-500 hover:text-gray-900">
    label
  </button>,
);
export const EmptyState = atom(<div className="flex h-72 items-center justify-center text-sm text-gray-500" />);
