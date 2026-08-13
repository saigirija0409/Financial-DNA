import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SubScores } from '../api/client';

interface RadarChartProps {
  subScores: SubScores;
  simulatedSubScores?: SubScores;
  title?: string;
  height?: number;
}

export const SevenDimensionRadarChart: React.FC<RadarChartProps> = ({
  subScores,
  simulatedSubScores,
  title = "7-Dimension Financial DNA Fingerprint",
  height = 360,
}) => {
  // Map sub_scores keys to human-readable names strictly matching the user requirement
  const data = [
    { dimension: 'Revenue Growth', baseline: subScores?.revenue_growth ?? 0, simulated: simulatedSubScores?.revenue_growth },
    { dimension: 'Profitability', baseline: subScores?.profitability ?? 0, simulated: simulatedSubScores?.profitability },
    { dimension: 'Cash Conversion', baseline: subScores?.cash_conversion ?? 0, simulated: simulatedSubScores?.cash_conversion },
    { dimension: 'Debt Health', baseline: subScores?.debt_health ?? 0, simulated: simulatedSubScores?.debt_health },
    { dimension: 'Liquidity', baseline: subScores?.liquidity ?? 0, simulated: simulatedSubScores?.liquidity },
    { dimension: 'Working Capital', baseline: subScores?.working_capital ?? 0, simulated: simulatedSubScores?.working_capital },
    { dimension: 'Stability', baseline: subScores?.stability ?? 0, simulated: simulatedSubScores?.stability },
  ];

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          {title}
        </h3>
        {simulatedSubScores && (
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Baseline
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Simulated Shock
            </span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
            <PolarAngleAxis
              dataKey="dimension"
              stroke="#94a3b8"
              tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name="Baseline Score"
              dataKey="baseline"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={simulatedSubScores ? 0.25 : 0.45}
            />
            {simulatedSubScores && (
              <Radar
                name="Simulated Shock"
                dataKey="simulated"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.45}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(val: number) => [`${val.toFixed(1)} / 100`, 'Score']}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-xs text-slate-400 font-mono">
        Deterministic 7-Dimension DNA Score System (0 - 100 Scale)
      </div>
    </div>
  );
};
