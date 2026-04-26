import type { PropsWithChildren } from "react";
import type { Page } from "../App";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps extends PropsWithChildren {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-line/70 px-6 py-6 md:block">
          <div className="mb-8 rounded-[28px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.055)]">
            <div className="mb-3 text-3xl">🍽️</div>
            <h1 className="whitespace-nowrap text-2xl font-black leading-tight text-ink">오늘의 밥값</h1>
            <p className="mt-2 whitespace-nowrap text-sm font-black text-main">공부한 만큼 먹어라!</p>
          </div>
          <BottomNav currentPage={currentPage} onNavigate={onNavigate} variant="desktop" />
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <div className="w-full px-0 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
