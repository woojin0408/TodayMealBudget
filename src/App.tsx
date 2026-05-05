import { useState } from "react";
import { AppLayout } from "./components/AppLayout";
import { useFocusSessions } from "./hooks/useFocusSessions";
import { useSettings } from "./hooks/useSettings";
import { FocusPage } from "./pages/FocusPage";
import { FocusResultPage } from "./pages/FocusResultPage";
import { HomePage } from "./pages/HomePage";
import { MealProfitPage } from "./pages/MealProfitPage";
import { MenuListPage } from "./pages/MenuListPage";
import { RecommendPage } from "./pages/RecommendPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DailyResultPage } from "./pages/DailyResultPage";
import type { FocusSession } from "./types/activity";

export type Page = "home" | "focus" | "focusResult" | "result" | "profit" | "recommend" | "menus" | "settings";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [lastSession, setLastSession] = useState<FocusSession | null>(null);
  const { settings, setSettings, resetSettings } = useSettings();
  const { sessions, addSession } = useFocusSessions();

  return (
    <AppLayout currentPage={page} onNavigate={setPage}>
      {page === "home" && <HomePage settings={settings} sessions={sessions} onNavigate={setPage} />}
      {page === "focus" && <FocusPage settings={settings} sessions={sessions} onAddSession={addSession} onResult={setLastSession} onNavigate={setPage} />}
      {page === "focusResult" && <FocusResultPage lastSession={lastSession} settings={settings} sessions={sessions} onNavigate={setPage} />}
      {page === "result" && <DailyResultPage settings={settings} sessions={sessions} />}
      {page === "profit" && <MealProfitPage settings={settings} />}
      {page === "recommend" && <RecommendPage settings={settings} sessions={sessions} />}
      {page === "menus" && <MenuListPage settings={settings} sessions={sessions} />}
      {page === "settings" && <SettingsPage settings={settings} setSettings={setSettings} resetSettings={resetSettings} />}
    </AppLayout>
  );
}
