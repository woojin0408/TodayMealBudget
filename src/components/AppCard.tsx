import type { PropsWithChildren } from "react";

interface AppCardProps extends PropsWithChildren {
  className?: string;
}

export function AppCard({ children, className = "" }: AppCardProps) {
  return <section className={`rounded-[20px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.055)] ${className}`}>{children}</section>;
}
