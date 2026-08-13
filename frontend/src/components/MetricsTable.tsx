import React from 'react';
import { CompanyMetrics, PeerAnomaly } from '../api/client';
import { AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Scale, Percent, Zap } from 'lucide-react';

interface MetricsTableProps {
  metrics: CompanyMetrics;
  peerAnomalies?: PeerAnomaly[];
}

export const MetricsTable: React.FC<MetricsTableProps> = ({ metrics, peerAnomalies = [] }) => {
  const metricItems = [
    {
      key: 'revenue_growth',
      label: 'Revenue Growth (YoY)',
      value: `${metrics.revenue_growth.toFixed(1)}%`,
      icon: TrendingUp,
      desc: 'Annual top-line revenue expansion rate',
    },
    {
      key: 'net_profit_margin',
      label: 'Net Profit Margin',
      value: `${metrics.net_profit_margin.toFixed(1)}%`,
      icon: Percent,
      desc: 'Percentage of revenue remaining as profit',
    },
    {
      key: 'cash_conversion',
      label: 'Cash Conversion Ratio',
      value: `${metrics.cash_conversion.toFixed(2)}x`,
      icon: DollarSign,
      desc: 'Operating Cash Flow relative to Net Income',
    },
    {
      key: 'debt_to_equity',
      label: 'Debt to Equity Ratio',
      value: `${metrics.debt_to_equity.toFixed(2)}x`,
      icon: Scale,
      desc: 'Total Liabilities over Shareholders Equity',
    },
    {
      key: 'current_ratio',
      label: 'Current Ratio',
      value: `${metrics.current_ratio.toFixed(2)}x`,
      icon: Zap,
      desc: 'Short-term assets / short-term liabilities',
    },
    {
      key: 'working_capital_ratio',
      label: 'Working Capital Ratio',
      value: `${(metrics.working_capital_ratio * 100).toFixed(1)}%`,
      icon: Scale,
      desc: 'Working Capital relative to Total Revenue',
    },
    {
      key: 'revenue_std_dev_ratio',
      label: 'Quarterly Volatility Ratio',
      value: `${(metrics.revenue_std_dev_ratio * 100).toFixed(1)}%`,
      icon: TrendingUp,
      desc: 'Standard deviation of quarterly revenue',
    },
  ];

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Financial Metrics & Peer Anomalies
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            {peerAnomalies.filter((a) => a.is_outlier).length} Statistical Outliers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {metricItems.map((item) => {
            const anomaly = peerAnomalies.find((a) => a.metric === item.key);
            const isOutlier = anomaly?.is_outlier;
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isOutlier
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Icon size={14} className="text-cyan-400" />
                    {item.label}
                  </div>
                  {isOutlier ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1 border border-amber-500/30">
                      <AlertTriangle size={10} /> Z: {anomaly.z_score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Normal</span>
                  )}
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">{item.value}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Statistical Outliers / Anomaly Feed */}
        {peerAnomalies.length > 0 && (
          <div className="border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Peer Group Z-Score Statistical Diagnostics
            </h4>
            <div className="space-y-2">
              {peerAnomalies.map((anom, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 border ${
                    anom.is_outlier
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300'
                  }`}
                >
                  {anom.is_outlier ? (
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-100">{anom.description}</span>
                    {anom.is_outlier && (
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Peer Mean: {anom.peer_mean.toFixed(2)} | Std Dev: {anom.peer_std.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
