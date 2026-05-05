import { useEffect, useMemo, useRef, useState } from "react";
import type { Page } from "../App";
import { activities, type ActivityType, type FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { getMealTypeForDate, getTodayBudgets } from "../services/budgetCalculator";
import { calculateEarnedBonus, calculateLiveBonus, getRewardStageInfo } from "../services/timerUtils";
import { formatMoney, formatTimer } from "../utils/format";
import { mealLabels } from "../types/meal";
import { ActivityButton } from "../components/ActivityButton";
import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";

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
  { left: "7%", delay: "0s", duration: "3.1s", sway: "22px", rotateStart: "-14deg", rotateEnd: "24deg", kind: "bill-50000", amount: "50,000", label: "오만원" },
  { left: "17%", delay: "0.6s", duration: "3.8s", sway: "-18px", rotateStart: "10deg", rotateEnd: "-20deg", kind: "coin-500", amount: "500", label: "오백원" },
  { left: "28%", delay: "1.2s", duration: "3.3s", sway: "28px", rotateStart: "-8deg", rotateEnd: "32deg", kind: "bill-10000", amount: "10,000", label: "만원" },
  { left: "42%", delay: "0.2s", duration: "4.2s", sway: "-24px", rotateStart: "16deg", rotateEnd: "-28deg", kind: "coin-100", amount: "100", label: "백원" },
  { left: "55%", delay: "1.5s", duration: "3.6s", sway: "18px", rotateStart: "-18deg", rotateEnd: "18deg", kind: "bill-50000", amount: "50,000", label: "오만원" },
  { left: "68%", delay: "0.9s", duration: "4s", sway: "-28px", rotateStart: "8deg", rotateEnd: "-24deg", kind: "bill-10000", amount: "10,000", label: "만원" },
  { left: "82%", delay: "1.8s", duration: "3.4s", sway: "20px", rotateStart: "-10deg", rotateEnd: "34deg", kind: "coin-500", amount: "500", label: "오백원" },
  { left: "92%", delay: "0.4s", duration: "4.4s", sway: "-20px", rotateStart: "12deg", rotateEnd: "-30deg", kind: "coin-100", amount: "100", label: "백원" }
];

interface ActiveTimerSnapshot {
  selectedActivity: ActivityType;
  status: TimerStatus;
  startedAt: number | null;
  accumulatedSeconds: number;
  displaySeconds: number;
  focusInterrupted?: boolean;
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

function formatLiveWon(value: number, showDecimals: boolean): string {
  const safeValue = Math.max(0, value);
  const displayValue = showDecimals ? Math.floor(safeValue * 100) / 100 : Math.floor(safeValue);
  return displayValue.toLocaleString("ko-KR", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
}

export function FocusPage({ settings, sessions, onAddSession, onResult, onNavigate }: FocusPageProps) {
  const restoredTimer = useMemo(() => loadActiveTimer(), []);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(restoredTimer?.selectedActivity ?? "study");
  const [status, setStatus] = useState<TimerStatus>(restoredTimer?.status ?? "idle");
  const [startedAt, setStartedAt] = useState<number | null>(restoredTimer?.startedAt ?? null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(restoredTimer?.accumulatedSeconds ?? 0);
  const [focusInterrupted, setFocusInterrupted] = useState(restoredTimer?.focusInterrupted ?? false);
  const [displaySeconds, setDisplaySeconds] = useState(() => {
    if (!restoredTimer) return 0;
    if (restoredTimer.status === "running" && restoredTimer.startedAt !== null) {
      return restoredTimer.accumulatedSeconds + (Date.now() - restoredTimer.startedAt) / 1000;
    }
    return restoredTimer.displaySeconds;
  });
  const intervalRef = useRef<number | null>(null);
  const isFinishingRef = useRef(false);
  const isResetConfirmOpenRef = useRef(false);
  const timerStateRef = useRef({
    accumulatedSeconds: restoredTimer?.accumulatedSeconds ?? 0,
    displaySeconds: restoredTimer?.displaySeconds ?? 0,
    focusInterrupted: restoredTimer?.focusInterrupted ?? false,
    selectedActivity: restoredTimer?.selectedActivity ?? "study",
    startedAt: restoredTimer?.startedAt ?? null,
    status: restoredTimer?.status ?? "idle"
  });
  const todayBudget = getTodayBudgets(settings, sessions);
  const reward = settings.rewards[selectedActivity];
  const liveBonus = calculateLiveBonus(displaySeconds, reward);
  const settledBonus = calculateEarnedBonus(displaySeconds, reward);
  const liveBonusText = formatLiveWon(liveBonus, status === "running");
  const liveBonusTextSize = liveBonusText.length > 13 ? "text-[34px] md:text-[56px]" : liveBonusText.length > 10 ? "text-[42px] md:text-[56px]" : "text-[56px]";
  const rewardStage = getRewardStageInfo(displaySeconds, reward);
  const rewardPerSecond = rewardStage.rewardPerMinute / 60;
  const rewardPerSecondLabel = Math.floor(rewardPerSecond * 100) / 100;
  const rewardMultiplierLabel = rewardStage.multiplier.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const currentMealType = getMealTypeForDate(new Date());
  const currentMealBudget = currentMealType === "lunch" ? todayBudget.lunch : currentMealType === "dinner" ? todayBudget.dinner : todayBudget.lateNight;

  const selectedMeta = useMemo(() => activities.find((activity) => activity.type === selectedActivity)!, [selectedActivity]);

  useEffect(() => {
    timerStateRef.current = {
      accumulatedSeconds,
      displaySeconds,
      focusInterrupted,
      selectedActivity,
      startedAt,
      status
    };
  });

  useEffect(() => {
    return () => {
      const snapshot = timerStateRef.current;
      if (isFinishingRef.current || snapshot.status !== "running" || snapshot.startedAt === null || snapshot.selectedActivity === "coding") return;

      const nextSeconds = snapshot.accumulatedSeconds + (Date.now() - snapshot.startedAt) / 1000;
      sessionStorage.setItem(
        ACTIVE_TIMER_KEY,
        JSON.stringify({
          selectedActivity: snapshot.selectedActivity,
          status: "paused",
          startedAt: null,
          accumulatedSeconds: nextSeconds,
          displaySeconds: nextSeconds,
          focusInterrupted: true
        } satisfies ActiveTimerSnapshot)
      );
    };
  }, []);

  useEffect(() => {
    if (status !== "running" || startedAt === null) return;

    intervalRef.current = window.setInterval(() => {
      setDisplaySeconds(accumulatedSeconds + (Date.now() - startedAt) / 1000);
    }, 100);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [status, startedAt, accumulatedSeconds]);

  useEffect(() => {
    if (status !== "running" || startedAt === null || selectedActivity === "coding") return;

    let alreadyPaused = false;
    const pauseForFocusExit = () => {
      if (alreadyPaused || isResetConfirmOpenRef.current) return;
      alreadyPaused = true;

      const nextSeconds = accumulatedSeconds + (Date.now() - startedAt) / 1000;
      setAccumulatedSeconds(nextSeconds);
      setDisplaySeconds(nextSeconds);
      setStartedAt(null);
      setStatus("paused");
      setFocusInterrupted(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pauseForFocusExit();
    };
    const handleWindowBlur = () => {
      pauseForFocusExit();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [accumulatedSeconds, selectedActivity, startedAt, status]);

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
      displaySeconds,
      focusInterrupted
    };
    sessionStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(snapshot));
  }, [accumulatedSeconds, displaySeconds, focusInterrupted, selectedActivity, startedAt, status]);

  function startTimer() {
    setStartedAt(Date.now());
    setStatus("running");
    setFocusInterrupted(false);
  }

  function selectActivity(type: ActivityType) {
    if (status !== "idle" || displaySeconds > 0) return;
    setSelectedActivity(type);
  }

  function pauseTimer(reason: "manual" | "focus-exit" = "manual") {
    if (status !== "running" || startedAt === null) return;
    const nextSeconds = accumulatedSeconds + (Date.now() - startedAt) / 1000;
    setAccumulatedSeconds(nextSeconds);
    setDisplaySeconds(nextSeconds);
    setStartedAt(null);
    setStatus("paused");
    setFocusInterrupted(reason === "focus-exit");
  }

  function stopTimer() {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    const finalElapsedSeconds = status === "running" && startedAt !== null ? accumulatedSeconds + (Date.now() - startedAt) / 1000 : displaySeconds;
    const endedAt = new Date();
    const session: FocusSession = {
      id: crypto.randomUUID(),
      activityType: selectedActivity,
      startedAt: new Date(endedAt.getTime() - finalElapsedSeconds * 1000).toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: finalElapsedSeconds,
      earnedBonus: calculateEarnedBonus(finalElapsedSeconds, reward)
    };

    onAddSession(session);
    onResult(session);
    setStatus("idle");
    setStartedAt(null);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    setFocusInterrupted(false);
    sessionStorage.removeItem(ACTIVE_TIMER_KEY);
    onNavigate("focusResult");
  }

  function resetTimerWithConfirmation() {
    isResetConfirmOpenRef.current = true;
    const shouldReset = window.confirm("진행 중인 집중 기록을 버릴까요?");
    isResetConfirmOpenRef.current = false;
    if (!shouldReset) return;

    setStatus("idle");
    setStartedAt(null);
    setAccumulatedSeconds(0);
    setDisplaySeconds(0);
    setFocusInterrupted(false);
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
          <ActivityButton
            key={activity.type}
            activity={activity}
            reward={settings.rewards[activity.type]}
            selected={selectedActivity === activity.type}
            disabled={status !== "idle" || displaySeconds > 0}
            onSelect={selectActivity}
          />
        ))}
      </div>

      <AppCard className={`relative overflow-hidden space-y-5 rounded-[28px] p-6 md:p-8 ${status === "running" ? "border-2 border-main" : "border-2 border-transparent"}`}>
        {status === "running" && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,159,67,0.08)_0%,transparent_70%)]" />}
        {status === "running" && (
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-56 overflow-hidden opacity-20">
            {MONEY_DROPS.map((drop) => (
              <span
                key={`${drop.left}-${drop.delay}`}
                className={`money-rain korean-money korean-money-${drop.kind} absolute -top-12`}
                style={{
                  left: drop.left,
                  ["--money-delay" as string]: drop.delay,
                  ["--money-duration" as string]: drop.duration,
                  ["--money-sway" as string]: drop.sway,
                  ["--money-rotate-start" as string]: drop.rotateStart,
                  ["--money-rotate-end" as string]: drop.rotateEnd
                }}
                aria-hidden="true"
              >
                {drop.kind.startsWith("bill") ? (
                  <>
                    <span className="korean-money-bank">한국은행</span>
                    <span className="korean-money-amount">₩{drop.amount}</span>
                    <span className="korean-money-label">{drop.label}</span>
                  </>
                ) : (
                  <>
                    <span className="korean-money-coin-inner">
                      <span>{drop.amount}</span>
                      <small>원</small>
                    </span>
                  </>
                )}
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
          {status === "paused" && (
            <p className={`mb-4 text-sm font-black ${focusInterrupted ? "text-danger" : "text-main"}`}>
              {focusInterrupted ? "집중 화면을 벗어나서 적립이 멈췄어요. 다시 시작할까요?" : "⏸ 일시정지됨 — 계속 할까요?"}
            </p>
          )}
        </div>

        <div className="relative z-10">
          <p className="mb-1 text-sm font-bold text-muted">💰 적립 중인 금액</p>
          <div className="flex min-w-0 flex-wrap items-end gap-1">
            <span className={`big-num max-w-full break-all font-black leading-none tracking-normal text-main ${liveBonusTextSize}`}>
              +{liveBonusText}
            </span>
            <span className="pb-1 text-2xl font-bold text-main">원</span>
          </div>
          {settledBonus > 0 && <p className="mt-2 text-xs font-bold text-muted">현재 완료하면 {formatMoney(settledBonus)} 적립</p>}
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 rounded-2xl bg-[#F8F3EE] px-4 py-2">
          <span className="text-sm font-bold text-muted">경과 시간</span>
          <span className="big-num text-xl font-black tracking-normal text-ink">{formatTimer(displaySeconds)}</span>
        </div>

        <p className="relative z-10 text-xs font-medium leading-relaxed text-muted">
          현재 {rewardMultiplierLabel}배 구간 · 초당 {rewardPerSecondLabel.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원씩 실시간 적립 · 기준 분당 {reward.toLocaleString("ko-KR")}원
          {rewardStage.nextMilestoneMinutes !== null ? ` · ${rewardStage.nextMilestoneMinutes}분부터 가속` : " · 2시간 이후 최고 가속"}
          {selectedActivity === "coding" ? " · 코딩은 탭 전환 예외" : ""}
        </p>

        <div className="relative z-10 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-[18px] border border-[#C5EDD7] bg-success-light p-4">
            <p className="text-xs font-black text-success">🎯 오늘 총 보너스</p>
            <p className="mt-1 text-xl font-black text-success">{formatMoney(todayBudget.bonus)}</p>
          </div>
          <div className="rounded-[18px] bg-main-light p-4">
            <p className="text-xs font-black text-main">예상 {mealLabels[currentMealType]} 예산</p>
            <p className="mt-1 text-xl font-black">{formatMoney(currentMealBudget + settledBonus)}</p>
          </div>
        </div>
      </AppCard>

      <div className="flex gap-3">
        <div className="flex flex-1 gap-3">
          {status === "running" ? (
            <PrimaryButton className="flex-1" onClick={() => pauseTimer()}>⏸ 일시정지</PrimaryButton>
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
