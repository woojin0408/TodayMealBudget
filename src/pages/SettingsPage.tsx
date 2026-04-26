import { activities } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";

interface SettingsPageProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  resetSettings: () => void;
}

export function SettingsPage({ settings, setSettings, resetSettings }: SettingsPageProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-bold text-main">설정</p>
        <h1 className="mt-1 text-3xl font-black">기본값 조정</h1>
      </header>

      <AppCard className="space-y-4">
        <NumberField label="점심 기본 식비" value={settings.baseLunchBudget} onChange={(value) => setSettings({ ...settings, baseLunchBudget: value })} />
        <NumberField label="저녁 기본 식비" value={settings.baseDinnerBudget} onChange={(value) => setSettings({ ...settings, baseDinnerBudget: value })} />
        <div className="rounded-2xl bg-main-light px-4 py-3">
          <p className="text-sm font-bold whitespace-nowrap text-main">야식 기본 식비</p>
          <p className="mt-1 text-lg font-black">0원</p>
          <p className="mt-1 text-xs font-semibold text-muted">오후 8시부터 오전 2시 사이 적립금만 쌓여요.</p>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        {activities.map((activity) => (
          <NumberField
            key={activity.type}
            label={`${activity.emoji} ${activity.label} 분당 보너스`}
            value={settings.rewards[activity.type]}
            onChange={(value) => setSettings({ ...settings, rewards: { ...settings.rewards, [activity.type]: value } })}
          />
        ))}
      </AppCard>

      <PrimaryButton variant="secondary" className="w-full" onClick={resetSettings}>
        기본값으로 초기화
      </PrimaryButton>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-bold whitespace-nowrap text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step={100}
        value={value}
        onChange={(event) => {
          if (event.target.value === "") return;
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue)) onChange(Math.max(0, nextValue));
        }}
        className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#FFF8EE] px-4 py-3 text-lg font-black outline-none focus:border-main"
      />
    </label>
  );
}
