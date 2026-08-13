import React from 'react';
import { CompanySummary } from '../api/client';
import { Building2, ChevronDown } from 'lucide-react';

interface CompanySelectorProps {
  companies: CompanySummary[];
  selectedId: string;
  onSelectCompany: (id: string) => void;
  loading?: boolean;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedId,
  onSelectCompany,
  loading = false,
}) => {
  const selected = companies.find((c) => c.id.toLowerCase() === selectedId.toLowerCase());

  return (
    <div className="relative inline-block w-full sm:w-80">
      <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Building2 size={14} className="text-cyan-400" />
        Select Target Enterprise
      </div>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onSelectCompany(e.target.value)}
          disabled={loading || companies.length === 0}
          className="w-full appearance-none bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner disabled:opacity-50 cursor-pointer"
        >
          {companies.map((comp) => (
            <option key={comp.id} value={comp.id} className="bg-slate-900 text-slate-100 py-1">
              {comp.name} ({comp.ticker}) — {comp.sector}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>
      {selected?.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
          {selected.description}
        </p>
      )}
    </div>
  );
};
