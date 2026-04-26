import { Home, List, Search, Star, Timer } from "lucide-react";
import type { Page } from "../App";

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: "home", label: "홈", icon: Home },
  { page: "focus", label: "집중", icon: Timer },
  { page: "result", label: "결과", icon: Star },
  { page: "recommend", label: "추천", icon: Search },
  { page: "menus", label: "메뉴", icon: List }
];

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  variant?: "mobile" | "desktop";
}

export function BottomNav({ currentPage, onNavigate, variant = "mobile" }: BottomNavProps) {
  if (variant === "desktop") {
    return (
      <nav aria-label="데스크톱 네비게이션" className="grid gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                active ? "bg-main text-white shadow-[0_6px_20px_rgba(255,159,67,0.28)]" : "text-muted hover:bg-white/70 hover:text-ink"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 3 : 2.2} />
              {item.label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="모바일 네비게이션" className="fixed bottom-0 left-1/2 z-20 grid h-[72px] w-full -translate-x-1/2 grid-cols-5 border-t border-black/10 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = currentPage === item.page;
        return (
          <button key={item.page} onClick={() => onNavigate(item.page)} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-bold transition active:scale-90 ${active ? "text-main" : "text-muted"}`}>
            <Icon size={20} strokeWidth={active ? 3 : 2} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
