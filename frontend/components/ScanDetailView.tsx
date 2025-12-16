
import React, { useState } from 'react';
import { ScanResult, RiskLevel } from '../types';
import { Share2, AlertTriangle, CheckCircle, AlertOctagon, Scale, ArrowLeft, Copy, Check, ExternalLink, Utensils, Leaf } from 'lucide-react';

interface ScanDetailViewProps {
  scan: ScanResult;
  onBack?: () => void; // Optional back handler (for Drawer navigation)
  backLabel?: string;
  className?: string;
}

export const ScanDetailView: React.FC<ScanDetailViewProps> = ({ scan, onBack, backLabel = "Back", className = "" }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const getHeaderColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'bg-green-500';
      case RiskLevel.CAUTION: return 'bg-yellow-500';
      case RiskLevel.TOXIC: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/result/${scan.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Label Scan: ${scan.verdict}`,
          text: `Verdict: ${scan.risk_level}. ${scan.reasoning}`,
          url: shareUrl
        });
      } catch (err) {
        console.log("Share failed", err);
        fallbackCopy(shareUrl);
      }
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert("Could not copy link. Manually copy the URL from browser.");
    });
  };

  const openBenefits = () => {
      const query = scan.search_query || `benefits of ${scan.verdict}`;
      window.open(`https://www.google.com/search?q=benefits+of+${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className={`w-full bg-surface pb-10 ${className}`}>
      {/* Header Image */}
      <div className="relative h-64 w-full bg-black shrink-0">
        <img src={scan.imageUrl} alt="Product" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 py-2 px-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition flex items-center gap-2 z-20 font-medium text-sm border border-white/10"
          >
            <ArrowLeft size={18} /> {backLabel}
          </button>
        )}
      </div>

      <div className="px-6 -mt-10 relative z-10">
        {/* Main Verdict Card */}
        <div className="bg-surface-light border border-white/5 rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold text-white ${getHeaderColor(scan.risk_level)}`}>
                {scan.risk_level === RiskLevel.SAFE && <CheckCircle size={14} />}
                {scan.risk_level === RiskLevel.CAUTION && <AlertTriangle size={14} />}
                {scan.risk_level === RiskLevel.TOXIC && <AlertOctagon size={14} />}
                {scan.risk_level.toUpperCase()}
            </div>
            {/* Estimated Weight Badge */}
            {scan.estimated_weight && (
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30">
                    <Scale size={14} />
                    {scan.estimated_weight}
                 </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">{scan.verdict}</h1>
          <p className="text-gray-300 leading-relaxed">{scan.reasoning}</p>
          
          {/* Benefits Button */}
          <button 
            onClick={openBenefits}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            View Health Benefits <ExternalLink size={14} />
          </button>
        </div>

        {/* Nutrition Info Card (Visible if nutrition data exists) */}
        {scan.nutrition && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                    <div className="p-2 bg-green-500/20 rounded-full">
                        <Leaf size={20} />
                    </div>
                    <h2 className="text-lg font-bold">Nutrition Estimate</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/20 p-3 rounded-xl text-center">
                        <span className="block text-xl font-bold text-white">{scan.nutrition.calories}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Calories</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl text-center">
                        <span className="block text-xl font-bold text-white">{scan.nutrition.protein}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Protein</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl text-center">
                        <span className="block text-xl font-bold text-white">{scan.nutrition.carbs}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Carbs</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl text-center">
                        <span className="block text-xl font-bold text-white">{scan.nutrition.fat}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Fat</span>
                    </div>
                </div>

                {scan.nutrition.vitamins && scan.nutrition.vitamins.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {scan.nutrition.vitamins.map((vit, idx) => (
                             <span key={idx} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/10">
                                {vit}
                             </span>
                        ))}
                    </div>
                )}
                 <div className="mt-3 pt-3 border-t border-green-500/20 text-xs text-green-300/50 italic">
                    *Estimated values based on visual size ({scan.estimated_weight || 'Unknown size'}).
                </div>
            </div>
        )}

        {/* Legal & Safety Controversies */}
        {scan.legal_issues && scan.legal_issues !== "None" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3 text-red-400">
                    <div className="p-2 bg-red-500/20 rounded-full">
                        <Scale size={20} />
                    </div>
                    <h2 className="text-lg font-bold">Legal & Safety Alerts</h2>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                    {scan.legal_issues}
                </p>
            </div>
        )}

        {/* Detailed Breakdown */}
        <div className="bg-surface-light border border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="font-semibold text-white">Composition / Ingredients</h2>
          </div>
          <div className="divide-y divide-white/5">
            {scan.ingredients.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm italic">
                    No specific ingredients or components identified.
                </div>
            ) : (
                scan.ingredients.map((ing, idx) => (
                <div key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{ing.name}</h3>
                        {/* Quantity Badge */}
                        {ing.quantity && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {ing.quantity}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ing.risk === RiskLevel.SAFE ? 'bg-green-500/20 text-green-400' :
                          ing.risk === RiskLevel.CAUTION ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                      }`}>
                          {ing.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{ing.description}</p>
                </div>
                ))
            )}
          </div>
        </div>

        <button 
          onClick={handleShare}
          className={`w-full mb-8 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition border ${
            copySuccess 
            ? 'bg-green-500/20 text-green-400 border-green-500/50' 
            : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50'
          }`}
        >
          {copySuccess ? <Check size={20} /> : <Share2 size={20} />} 
          {copySuccess ? "Link Copied!" : "Share Report"}
        </button>
      </div>
    </div>
  );
};
