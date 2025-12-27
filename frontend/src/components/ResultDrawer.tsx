
import React, { useState, useEffect } from 'react';
import { ScanResult, RiskLevel } from '../types';
import { X, ChevronRight, BarChart3 } from 'lucide-react';
import { ScanDetailView } from './ScanDetailView';

interface ResultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  results: ScanResult[];
}

export const ResultDrawer: React.FC<ResultDrawerProps> = ({ isOpen, onClose, results }) => {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  // Reset selection when drawer closes or results change
  useEffect(() => {
    if (!isOpen) {
      // Small timeout to allow transition to finish before resetting state (smoother UX)
      const t = setTimeout(() => setSelectedResultId(null), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // If only one result, automatically select it (unless we want to show it in list mode? No, direct detail is better)
  useEffect(() => {
    if (isOpen && results.length === 1) {
      setSelectedResultId(results[0].id);
    }
  }, [isOpen, results]);

  if (!isOpen || results.length === 0) return null;

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'text-green-500 border-green-500/30 bg-green-500/10';
      case RiskLevel.CAUTION: return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case RiskLevel.TOXIC: return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  // --- Render Logic ---

  // 1. Detail View (Selected Item)
  if (selectedResultId) {
    const result = results.find(r => r.id === selectedResultId);
    if (!result) return null;

    const showBackButton = results.length > 1;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
          onClick={onClose}
        />
        <div className="bg-surface w-full max-w-md h-[92dvh] rounded-t-3xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-out shadow-2xl border-t border-white/10 overflow-hidden relative">
          
          {/* Close Button Absolute for Details View */}
          <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 text-white">
              <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto no-scrollbar">
             <ScanDetailView 
                scan={result} 
                onBack={showBackButton ? () => setSelectedResultId(null) : undefined}
                backLabel="Back to Dashboard"
                className="min-h-full"
             />
          </div>
        </div>
      </div>
    );
  }

  // 2. Batch Dashboard View (List of Items)
  const safeCount = results.filter(r => r.risk_level === RiskLevel.SAFE).length;
  const cautionCount = results.filter(r => r.risk_level === RiskLevel.CAUTION).length;
  const toxicCount = results.filter(r => r.risk_level === RiskLevel.TOXIC).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      <div className="bg-surface-light w-full max-w-md h-[85dvh] rounded-t-3xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-out shadow-2xl border-t border-white/10">
        
        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-primary" />
                    <h2 className="text-xl font-bold text-white">Batch Analysis</h2>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-2xl font-bold text-green-500">{safeCount}</span>
                    <span className="text-[10px] uppercase font-bold text-green-400/80 tracking-wider">Safe</span>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-2xl font-bold text-yellow-500">{cautionCount}</span>
                    <span className="text-[10px] uppercase font-bold text-yellow-400/80 tracking-wider">Caution</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-2xl font-bold text-red-500">{toxicCount}</span>
                    <span className="text-[10px] uppercase font-bold text-red-400/80 tracking-wider">Toxic</span>
                </div>
            </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Scanned Items ({results.length})</span>
            </div>

            <div className="space-y-3">
            {results.map((item) => (
                <div 
                key={item.id} 
                onClick={() => setSelectedResultId(item.id)}
                className="bg-black/20 border border-white/5 rounded-xl p-3 flex gap-4 items-center active:scale-95 transition cursor-pointer hover:bg-white/5"
                >
                <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                    <div className={`absolute inset-0 opacity-20 ${getRiskColor(item.risk_level)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getRiskColor(item.risk_level)}`}>
                            {item.risk_level}
                        </span>
                    </div>
                    <h3 className="font-semibold text-white truncate text-sm">{item.verdict}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.category.replace('_', ' ')}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};
