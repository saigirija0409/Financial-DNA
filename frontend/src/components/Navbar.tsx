import React from 'react';
import { LayoutDashboard, Sliders, Target, LineChart, Calculator, Sparkles, Dna } from 'lucide-react';

export type TabType = 'dashboard' | 'stress' | 'counterfactual' | 'mutate' | 'calculator' | 'ai-insight';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  backendOnline: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, backendOnline }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: '7D Dashboard', icon: LayoutDashboard },
    { id: 'stress' as TabType, label: 'Stress Simulator', icon: Sliders },
    { id: 'counterfactual' as TabType, label: 'Minimum Fix Solver', icon: Target },
    { id: 'mutate' as TabType, label: 'Multi-Quarter Shocks', icon: LineChart },
    { id: 'calculator' as TabType, label: 'Custom Calculator', icon: Calculator },
    { id: 'ai-insight' as TabType, label: 'AI Context / Insight', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
              <Dna size={22} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-mono">
                FINANCIAL <span className="title-gradient">DNA</span>
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                v1.0 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              7-Dimension Financial Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Backend Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              backendOnline === true
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : backendOnline === false
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                : 'bg-amber-400 animate-ping'
            }`}
          />
          <span className="text-slate-300">
            {backendOnline === true
              ? 'FastAPI Connected'
              : backendOnline === false
              ? 'Backend Offline'
              : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
