import { useState, useEffect } from 'react';
import {
  CompanySummary,
  CompanyDetailResponse,
  fetchCompanies,
  fetchCompanyDetail,
} from './api/client';
import { Navbar, TabType } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { StressSimulatorPage } from './pages/StressSimulatorPage';
import { MinimumFixSolverPage } from './pages/MinimumFixSolverPage';
import { MultiQuarterShocksPage } from './pages/MultiQuarterShocksPage';
import { CustomCalculatorPage } from './pages/CustomCalculatorPage';
import { AIInsightPage } from './pages/AIInsightPage';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('tcs');
  const [companyDetail, setCompanyDetail] = useState<CompanyDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial load of benchmark companies
  const loadCompanyData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await fetchCompanies();
      setCompanies(list);
      setBackendOnline(true);

      const defaultId = list.length > 0 ? list[0].id : 'tcs';
      const targetId = selectedCompanyId || defaultId;
      setSelectedCompanyId(targetId);

      const detail = await fetchCompanyDetail(targetId);
      setCompanyDetail(detail);
    } catch (err: any) {
      setBackendOnline(false);
      setErrorMsg("Backend Offline. Could not connect to http://localhost:8000/api/companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  // Fetch detail whenever selected company changes
  useEffect(() => {
    if (!selectedCompanyId || !backendOnline) return;
    let isMounted = true;

    const getDetail = async () => {
      try {
        const detail = await fetchCompanyDetail(selectedCompanyId);
        if (isMounted) setCompanyDetail(detail);
      } catch (err) {
        if (isMounted) {
          setBackendOnline(false);
          setErrorMsg("Backend Offline. Server un-reachable at http://localhost:8000");
        }
      }
    };

    getDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          backendOnline={backendOnline}
        />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              companyDetail={companyDetail}
              loading={loading}
              error={errorMsg}
              onRetry={loadCompanyData}
            />
          )}

          {activeTab === 'stress' && (
            <StressSimulatorPage
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              backendOnline={backendOnline}
            />
          )}

          {activeTab === 'counterfactual' && (
            <MinimumFixSolverPage
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              backendOnline={backendOnline}
            />
          )}

          {activeTab === 'mutate' && (
            <MultiQuarterShocksPage
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              backendOnline={backendOnline}
            />
          )}

          {activeTab === 'calculator' && (
            <CustomCalculatorPage backendOnline={backendOnline} />
          )}

          {activeTab === 'ai-insight' && (
            <AIInsightPage
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              backendOnline={backendOnline}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        FINANCIAL DNA — 7-Dimension Financial Intelligence Platform | Powered by FastAPI Backend
      </footer>
    </div>
  );
}
