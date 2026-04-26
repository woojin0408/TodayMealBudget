interface QuestionOptionProps<T extends string> {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
}

export function QuestionOption<T extends string>({ label, value, selected, onSelect }: QuestionOptionProps<T>) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`rounded-2xl border px-4 py-3 text-sm font-bold whitespace-nowrap transition active:scale-[0.96] ${
        selected ? "border-main bg-main text-white shadow-[0_3px_12px_rgba(255,159,67,0.38)]" : "border-line bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}
