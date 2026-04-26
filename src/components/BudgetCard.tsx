import { getBudgetTierMessage } from "../services/menuRecommendation";
import { formatMoney } from "../utils/format";
import { AppCard } from "./AppCard";
import { MoneyText } from "./MoneyText";

interface BudgetCardProps {
  title: string;
  emoji: string;
  baseBudget: number;
  bonus: number;
  total: number;
}

export function BudgetCard({ title, emoji, baseBudget, bonus, total }: BudgetCardProps) {
  return (
    <AppCard className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">{title}</p>
        <span className="text-2xl">{emoji}</span>
      </div>
      <MoneyText amount={total} className="block text-4xl font-black text-ink" />
      <p className="text-sm text-muted">기본 {formatMoney(baseBudget)} + 보너스 {formatMoney(bonus)}</p>
      <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">{getBudgetTierMessage(total)} 😎</p>
    </AppCard>
  );
}
