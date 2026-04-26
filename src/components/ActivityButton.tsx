import type { ActivityMeta, ActivityType } from "../types/activity";

interface ActivityButtonProps {
  activity: ActivityMeta;
  reward: number;
  selected: boolean;
  onSelect: (type: ActivityType) => void;
}

export function ActivityButton({ activity, reward, selected, onSelect }: ActivityButtonProps) {
  return (
    <button
      onClick={() => onSelect(activity.type)}
      className={`rounded-[18px] border-0 p-3 text-center transition active:scale-[0.96] ${
        selected ? "bg-main text-white shadow-[0_4px_18px_rgba(255,159,67,0.38)]" : "bg-white text-muted shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="text-2xl">{activity.emoji}</div>
      <div className="mt-1 text-sm font-black whitespace-nowrap">{activity.label}</div>
      <div className={`text-[10px] font-semibold whitespace-nowrap ${selected ? "text-white/80" : "text-muted"}`}>분당 {reward.toLocaleString("ko-KR")}원</div>
    </button>
  );
}
