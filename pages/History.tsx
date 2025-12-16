
import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/NavBar';
import { getHistory } from '../services/storageService';
import { ScanResult, RiskLevel } from '../types';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, PieChart } from 'lucide-react';

export const History: React.FC = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'bg-green-500/20 text-green-400 border-green-500/20';
      case RiskLevel.CAUTION: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case RiskLevel.TOXIC: return 'bg-red-500/20 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const safeCount = history.filter(r => r.risk_level === RiskLevel.SAFE).length;
  const toxicCount = history.filter(r => r.risk_level === RiskLevel.TOXIC).length;
  const cautionCount = history.filter(r => r.risk_level === RiskLevel.CAUTION).length;

  return (
    <div className="min-h-[100dvh] bg-surface pb-20">
      <div className="p-6 pt-12">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">History</h1>
            <span className="text-xs text-gray-500 bg-white/10 px-3 py-1 rounded-full">{history.length} scans</span>
        </div>

        {/* Dashboard Stats */}
        {history.length > 0 && (
            <div className="bg-surface-light border border-white/5 rounded-2xl p-4 mb-8 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <PieChart size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Lifetime Stats</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="text-xl font-bold text-green-500">{safeCount}</div>
                        <div className="text-[10px] text-green-400/70 uppercase mt-1">Safe</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <div className="text-xl font-bold text-yellow-500">{cautionCount}</div>
                        <div className="text-[10px] text-yellow-400/70 uppercase mt-1">Caution</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="text-xl font-bold text-red-500">{toxicCount}</div>
                        <div className="text-[10px] text-red-400/70 uppercase mt-1">Toxic</div>
                    </div>
                </div>
            </div>
        )}
        
        {history.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No scans yet.</p>
            <p className="text-sm mt-2">Scan a product to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Scans</h2>
            {history.map((scan) => (
              <Link 
                key={scan.id} 
                to={`/result/${scan.id}`}
                className="block bg-surface-light border border-white/5 rounded-xl overflow-hidden hover:bg-white/5 transition"
              >
                <div className="flex h-24">
                  {/* Image Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0 bg-black relative">
                    <img src={scan.imageUrl} alt="scan" className="w-full h-full object-cover opacity-80" />
                    <div className={`absolute bottom-0 inset-x-0 h-1 ${
                        scan.risk_level === RiskLevel.SAFE ? 'bg-green-500' :
                        scan.risk_level === RiskLevel.TOXIC ? 'bg-red-500' :
                        scan.risk_level === RiskLevel.CAUTION ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white line-clamp-1 text-sm">{scan.verdict}</h3>
                        <span className="text-[10px] text-gray-500">{formatDate(scan.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{scan.category.replace('_', ' ')}</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getRiskColor(scan.risk_level)}`}>
                        {scan.risk_level}
                      </span>
                      <ChevronRight size={16} className="text-gray-600" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
};
