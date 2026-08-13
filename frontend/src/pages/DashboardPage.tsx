import React from 'react';
import { CompanySummary, CompanyDetailResponse } from '../api/client';
import { CompanySelector } from '../components/CompanySelector';
import { CompositeScoreCard } from '../components/CompositeScoreCard';
import { SevenDimensionRadarChart } from '../components/RadarChart';
import { MetricsTable } from '../components/MetricsTable';
import { ErrorBanner } from '../components/ErrorBanner';

interface DashboardPageProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  companyDetail: CompanyDetailResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  companyDetail,
  loading,
  error,
  onRetry,
}) => {
  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }

  const selectedSummary = companies.find(
    (c) => c.id.toLowerCase() === selectedCompanyId.toLowerCase()
  );

  const subScores = companyDetail?.dna_score?.sub_scores || selectedSummary?.sub_scores;
  const compositeScore = companyDetail?.dna_score?.composite_score ?? selectedSummary?.composite_score ?? 0;
  const healthVerdict = companyDetail?.dna_score?.health_verdict || selectedSummary?.health_verdict || 'N/A';
  const metrics = companyDetail?.company?.metrics || selectedSummary?.metrics;
  const peerAnomalies = companyDetail?.peer_anomalies || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            7-Dimension Financial Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time balance sheet fingerprinting & benchmark peer group diagnostics
          </p>
        </div>

        <CompanySelector
          companies={companies}
          selectedId={selectedCompanyId}
          onSelectCompany={onSelectCompany}
          loading={loading}
        />
      </div>

      {loading && !companyDetail ? (
        <div className="glass-panel p-12 text-center text-slate-400 font-mono">
          <div className="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Fetching 7-Dimension DNA profile from FastAPI...</p>
        </div>
      ) : (
        <>
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Composite Score + Radar Chart */}
            <div className="lg:col-span-5 space-y-6">
              {subScores && (
                <CompositeScoreCard
                  score={compositeScore}
                  healthVerdict={healthVerdict}
                  companyName={selectedSummary?.name}
                  ticker={selectedSummary?.ticker}
                  sector={selectedSummary?.sector}
                />
              )}

              {subScores && <SevenDimensionRadarChart subScores={subScores} height={320} />}
            </div>

            {/* Right Col: Detailed Metrics Table */}
            <div className="lg:col-span-7">
              {metrics && (
                <MetricsTable metrics={metrics} peerAnomalies={peerAnomalies} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
