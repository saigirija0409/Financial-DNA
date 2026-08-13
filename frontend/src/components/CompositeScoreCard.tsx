import React from 'react';
import { ShieldCheck, ShieldAlert, Activity, Award } from 'lucide-react';

interface CompositeScoreCardProps {
  score: number;
  healthVerdict: string;
  ticker?: string;
  companyName?: string;
  sector?: string;
  delta?: number;
}

export const CompositeScoreCard: React.FC<CompositeScoreCardProps> = ({
  score,
  healthVerdict,
  ticker,
  companyName,
  sector,
  delta,
}) => {
  const getBadgeStyle = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes('fortress') || v.includes('elite')) {
      return { class: 'badge-fortress', icon: Award, color: '#34d399', stroke: '#10b981' };
    }
    if (v.includes('resilient')) {
      return { class: 'badge-resilient', icon: ShieldCheck, color: '#38bdf8', stroke: '#38bdf8' };
    }
    if (v.includes('moderate') || v.includes('caution')) {
      return { class: 'badge-moderate', icon: Activity, color: '#fbbf24', stroke: '#f59e0b' };
    }
    return { class: 'badge-vulnerable', icon: ShieldAlert, color: '#f87171', stroke: '#f43f5e' };
  };

  const badgeInfo = getBadgeStyle(healthVerdict);
  const Icon = badgeInfo.icon;

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 glass-panel-glow flex flex-col justify-between relative overflow-hidden">
      {/* Background Accent Blur */}
      <div 
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: badgeInfo.color }}
      />

      <div>
        <div className="flex items-center justify-between">
          <div>
            {companyName ? (
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  {companyName}
                  {ticker && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono">
                      {ticker}
                    </span>
                  )}
                </h2>
                {sector && <p className="text-xs text-slate-400 mt-0.5">{sector}</p>}
              </div>
            ) : (
              <h2 className="font-semibold text-slate-400 text-sm tracking-wide uppercase">
                Composite Financial DNA Score
              </h2>
            )}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badgeInfo.class}`}>
            <Icon size={14} />
            {healthVerdict}
          </div>
        </div>

        <div className="flex items-center justify-center my-6 relative">
          <svg className="w-44 h-44 transform -rotate-90">
            {/* Track */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Bar */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke={badgeInfo.stroke}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-50 font-mono tracking-tight">
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              Out of 100
            </span>
            {delta !== undefined && (
              <span
                className={`text-xs font-bold font-mono mt-1 px-2 py-0.5 rounded-full ${
                  delta >= 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} Pts
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeInfo.color }}></span>
          7-Dimension Algorithm
        </span>
        <span className="font-mono text-slate-300">FastAPI Engine</span>
      </div>
    </div>
  );
};
