import { useEffect, useMemo, useRef, useState } from "react";
import type { Page } from "../App";
import { activities, type ActivityType, type FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { getMealTypeForDate, getTodayBudgets } from "../services/budgetCalculator";
import { calculateEarnedBonus } from "../services/timerUtils";
import { formatMoney, formatTimer } from "../utils/format";
import { mealLabels } from "../types/meal";
import { ActivityButton } from "../components/ActivityButton";
import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { useCountUp } from "../hooks/useCountUp";

interface FocusPageProps {
  settings: AppSettings;
  sessions: FocusSession[];
  onAddSession: (session: FocusSession) => void;
  onResult: (session: FocusSession) => void;
  onNavigate: (page: Page) => void;
}

type TimerStatus = "idle" | "running" | "paused";

const ACTIVE_TIMER_KEY = "today-meal-budget-active-timer";
const MONEY_DROPS = [
  { left: "7%", delay: "0s", duration: "3.1s", sway: "22px", symbol: "💸" },
  { left: "17%", delay: "0.6s", duration: "3.8s", sway: "-18px", symbol: "💰" },
  { left: "28%", delay: "1.2s", duration: "3.3s", sway: "28px", symbol: "🪙" },
  { left: "42%", delay: "0.2s", duration: "4.2s", sway: "-24px", symbol: "💸" },
  { left: "55%", delay: "1.5s", duration: "3.6s", sway: "18px", symbol: "💰" },
  { left: "68%", delay: "0.9s", duration: "4s", sway: "-28px", symbol: "🪙" },
  { left: "82%", delay: "1.8s", duration: "3.4s", sway: "20px", symbol: "💸" },
  { left: "92%", delay: "0.4s", duration: "4.4s", sway: "-20px", symbol: "💰" }
];

interface ActiveTimerSnapshot {
  selectedActivity: ActivityType;
  status: TimerStatus;
  startedAt: number | null;
  accumulatedSeconds: number;
  displaySeconds: number;
}

function loadActiveTimer(): ActiveTimerSnapshot | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_TIMER_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as ActiveTimerSnapshot;
    if (!activities.some((activity) => activity.type === snapshot.selectedActivity)) return null;
    if (!["idle", "running", "paused"].includes(snapshot.status)) return null;
    return snapshot;
  } catch {
    return null;
  }
}

export function FocusPage({ settings, sessions, onAddSession, onResult, onNavigate }: FocusPageProps) {
  const restoredTimer = useMemo(() => loadActiveTimer(), []);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(restoredTimer?.selectedActivity ?? "study");
  const [status, setStatus] = useState<TimerStatus>(restoredTimer?.status ?? "idle");
  const [startedAt, setStartedAt] = useState<number | null>(restoredTimer?.startedAt ?? null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(restoredTimer?.accumulatedSeconds ?? 0);
  const [displaySeconds, setDisplaySeconds] = useState(() => {
    if (!restoredTimer) return 0;
    if (restoredTimer.status === "running" && restoredTimer.startedAt !== null) {
      return restoredTimer.accumulatedSeconds + Math.floor((Date.now() - restoredTimer.startedAt) / 1000);
    }
    return restoredTimer.displaySeconds;
  });
  const intervalRef = useRef<number | null>(null);
  const todayBudget = getTodayBudgets(settings, sessions);
  const reward = settings.rewards[selectedActivity];
  const currentBonus = calculateEarnedBonus(displaySeconds, reward);
  const currentMealType = getMealTypeForDate(new Date());
  const currentMealBudget = currentMealType === "lunch" ? todayBudget.lunch : currentMealType === "dinner" ? todayBudget.dinner : todayBudget.lateNight;
  const animatedBonus = useCountUp(currentBonus, 400);

  const selectedMeta = useMemo(() => activities.find((activity) => activity.type === selectedActivity)!, [selectedActivity]);

  useEffect(() => {
    if (status !== "running" || startedAt === null) return;

    intervalRef.current = window.setInterval(() => {
      setDisplaySeconds(accumulatedSeconds + Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [status, startedAt, accumulatedSeconds]);

  useEffect(() => {
    if (status === "idle" && displaySeconds <= 0) {
      sessionStorage.removeItem(ACTIVE_TIMER_KEY);
      return;
    }

    const snapshot: ActiveTimerSnapshot = {
      selectedActivity,
      status,
      startedAt,
      accumulatedSeconds,
      displaySeconds
    };
    sessionStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(snapshot));
  }, [accumulatedSeconds, displaySeconds, selectedActivity, startedAt, status]);

  function startTimer() {
    setStartedAt(Date.now());
    setStatus("running");
  }

  function pauseTimer() {
    if (status !== "running" || startedAt === null) return;
    const nextSeconds = accumulatedSeconds + Math.floor((Date.now() - startedAt) / 1000);
    setAccumulatedSeconds(nextSeconds);
    setDisplaySeconds(nextSeconds);
    setStartedAt(null);
    setStatus("paused");
  }

  function stopTimer() {
    const finalSeconds = status === "running" && startedAt !== null ? accumulatedSeconds + Math.floor((Date.now() - startedAt) / 1000) : displaySeconds;
    const endedAt = new Date();
    const session: FocusSession = {
      id: crypto.randomUUID(),
      activityType: selectedActivity,
      startedAt: new Date(endedAt.getTime() - finalSeconds * 1000).toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: finalSeconds,
      earnedBonus: calculateEarnedBonus(finalSeconds, reward)
    };

    onAddSession(session);
    onResult(session);
    setStatus("idle");
    setStartedAt(null);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    sessionStorage.removeItem(ACTIVE_TIMER_KEY);
    onNavigate("focusResult");
  }

  function resetTimerWithConfirmation() {
    const shouldReset = window.confirm("진행 중인 집중 기록을 버릴까요?");
    if (!shouldReset) return;

    setStatus("idle");
    setStartedAt(null);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    sessionStorage.removeItem(ACTIVE_TIMER_KEY);
  }

  return (
    <div className="slide-in space-y-5 px-5 pt-7 md:px-0 md:pt-0">
      <header>
        <p className="text-sm font-bold text-muted">집중할수록 밥값이 늘어나요</p>
        <h1 className="mt-1 text-[26px] font-black tracking-normal">집중 타이머 ⏱️</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 xl:max-w-3xl">
        {activities.map((activity) => (
          <ActivityButton key={activity.type} activity={activity} reward={settings.rewards[activity.type]} selected={selectedActivity === activity.type} onSelect={setSelectedActivity} />
        ))}
      </div>

      <AppCard className={`relative overflow-hidden space-y-5 rounded-[28px] p-6 md:p-8 ${status === "running" ? "border-2 border-main" : "border-2 border-transparent"}`}>
        {status === "running" && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,159,67,0.08)_0%,transparent_70%)]" />}
        {status === "running" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {MONEY_DROPS.map((drop) => (
              <span
                key={`${drop.left}-${drop.delay}`}
                className="money-rain absolute -top-10 text-3xl md:text-4xl"
                style={{
                  left: drop.left,
                  ["--money-delay" as string]: drop.delay,
                  ["--money-duration" as string]: drop.duration,
                  ["--money-sway" as string]: drop.sway
                }}
              >
                {drop.symbol}
              </span>
            ))}
          </div>
        )}
        <div className="relative z-10">
          {status === "running" && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-main/10 px-4 py-2 text-sm font-black text-main">
              <span className="inline-block h-2 w-2 rounded-full bg-main" style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
              🔥 집중 유지 중
            </div>
          )}
          {status === "idle" && displaySeconds === 0 && <p className="mb-4 text-sm font-bold text-muted">{selectedMeta.emoji} 시작 버튼을 눌러주세요</p>}
          {status === "paused" && <p className="mb-4 text-sm font-black text-main">⏸ 일시정지됨 — 계속 할까요?</p>}
        </div>

        <div className="relative z-10">
          <p className="mb-1 text-sm font-bold text-muted">💰 적립 중인 금액</p>
          <div className="flex items-end gap-1">
            <span className={`big-num text-[56px] font-black leading-none tracking-normal text-main ${status === "running" && currentBonus > 0 ? "money-tick" : ""}`}>
              +{animatedBonus.toLocaleString("ko-KR")}
            </span>
            <span className="pb-1 text-2xl font-bold text-main">원</span>
          </div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 rounded-2xl bg-[#F8F3EE] px-4 py-2">
          <span className="text-sm font-bold text-muted">경과 시간</span>
          <span className="big-num text-xl font-black tracking-normal text-ink">{formatTimer(displaySeconds)}</span>
        </div>

        <p className="relative z-10 text-xs font-medium whitespace-nowrap text-muted">
          {Math.floor(displaySeconds / 60) > 0
            ? `${Math.floor(displaySeconds / 60)}분 집중 완료 · 다음 1분마다 ${reward.toLocaleString("ko-KR")}원 추가`
            : `1분 이상 집중하면 ${reward.toLocaleString("ko-KR")}원/분 적립 시작`}
        </p>

        <div className="relative z-10 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-[18px] border border-[#C5EDD7] bg-success-light p-4">
            <p className="text-xs font-black text-success">🎯 오늘 총 보너스</p>
            <p className="mt-1 text-xl font-black text-success">{formatMoney(todayBudget.bonus)}</p>
          </div>
          <div className="rounded-[18px] bg-main-light p-4">
            <p className="text-xs font-black text-main">예상 {mealLabels[currentMealType]} 예산</p>
            <p className="mt-1 text-xl font-black">{formatMoney(currentMealBudget + currentBonus)}</p>
          </div>
        </div>
      </AppCard>

      <div className="flex gap-3">
        <div className="flex flex-1 gap-3">
          {status === "running" ? (
            <PrimaryButton className="flex-1" onClick={pauseTimer}>⏸ 일시정지</PrimaryButton>
          ) : (
            <PrimaryButton className="flex-1" onClick={startTimer}>{status === "paused" ? "▶ 계속하기" : "▶ 시작"}</PrimaryButton>
          )}
        </div>
        {displaySeconds > 0 && status !== "running" && (
          <PrimaryButton variant="success" onClick={stopTimer}>✅ 완료</PrimaryButton>
        )}
        {(status === "running" || displaySeconds > 0) && (
          <button
            onClick={resetTimerWithConfirmation}
            className="h-14 w-14 shrink-0 rounded-2xl bg-[#F0EAE0] text-lg font-black text-muted transition active:scale-95"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
