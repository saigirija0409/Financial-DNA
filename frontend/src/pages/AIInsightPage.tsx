import React, { useState, useEffect } from 'react';
import { CompanySummary, fetchAIPromptData, AIPromptResponse } from '../api/client';
import { CompanySelector } from '../components/CompanySelector';
import { ErrorBanner } from '../components/ErrorBanner';
import { Sparkles, Copy, Check, Terminal, Cpu } from 'lucide-react';

interface AIInsightPageProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  backendOnline: boolean | null;
}

export const AIInsightPage: React.FC<AIInsightPageProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  backendOnline,
}) => {
  const [promptData, setPromptData] = useState<AIPromptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPrompt = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAIPromptData(selectedCompanyId);
      setPromptData(res);
    } catch (err: any) {
      setError("Backend Offline. Could not fetch http://localhost:8000/api/ai-prompt-data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, [selectedCompanyId]);

  const handleCopy = () => {
    if (promptData?.formatted_llm_prompt) {
      navigator.clipboard.writeText(promptData.formatted_llm_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (backendOnline === false || error) {
    return <ErrorBanner message={error || "Backend Offline"} onRetry={fetchPrompt} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={22} />
            AI LLM Context & Insight Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structured prompt generator ready to inject into Gemini 1.5 Pro / Claude 3.5 Sonnet APIs
          </p>
        </div>

        <CompanySelector
          companies={companies}
          selectedId={selectedCompanyId}
          onSelectCompany={onSelectCompany}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Explanation Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 border-indigo-500/30 bg-indigo-950/10">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-3">
              <Cpu size={18} /> LLM Prompt Architecture
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This module formats 7-Dimension DNA sub-scores, raw balance sheet metrics, and peer Z-score anomalies into a structured prompt contract for AI synthesis.
            </p>
            <div className="space-y-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>FastAPI Engine</span>
                <span className="text-emerald-400">✅ Deterministic</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>LLM Integration</span>
                <span className="text-cyan-400">Gemini / Claude Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Prompt Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="glass-panel p-12 text-center text-slate-400 font-mono">
              <div className="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p>Formatting AI Prompt Context...</p>
            </div>
          ) : (
            promptData && (
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                    <Terminal size={16} className="text-cyan-400" />
                    Structured Prompt Context (Target: {selectedCompanyId.toUpperCase()})
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied Prompt!' : 'Copy to Clipboard'}
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-cyan-200/90 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                    {promptData.formatted_llm_prompt}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
