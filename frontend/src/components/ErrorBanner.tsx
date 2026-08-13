import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = "Backend Offline. Please start the FastAPI backend on http://localhost:8000.",
  onRetry,
}) => {
  return (
    <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/20 text-rose-200 animate-fade-in my-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
          <WifiOff size={28} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-rose-300">Backend Offline</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 font-mono text-rose-300">
              HTTP 8000
            </span>
          </div>
          <p className="text-sm text-rose-300/80 mt-1">
            {message}
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl border border-rose-500/30 transition-all font-medium text-sm whitespace-nowrap"
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      )}
    </div>
  );
};
