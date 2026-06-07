type Props = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
};

export function StatsCard({ label, value, sub, icon }: Props) {
  return (
    <div className="bg-white border border-neutral-150 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">
          {label}
        </p>
        <span className="text-neutral-300">{icon}</span>
      </div>
      <p className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-neutral-400 mt-1">{sub}</p>
      )}
    </div>
  );
}
