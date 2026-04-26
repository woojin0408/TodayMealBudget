import { formatMoney } from "../utils/format";

interface MoneyTextProps {
  amount: number;
  className?: string;
}

export function MoneyText({ amount, className = "" }: MoneyTextProps) {
  return <strong className={`tabular-nums ${className}`}>{formatMoney(amount)}</strong>;
}
