
import React, { useState } from 'react';
import { Camera } from '../components/Camera';
import { ResultDrawer } from '../components/ResultDrawer';
import { analyzeImages } from '../services/geminiService';
import { saveScan } from '../services/storageService';
import { ScanResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { NavBar } from '../components/NavBar';
import { InstallPrompt } from '../components/InstallPrompt';

export const Home: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Force remount camera to clear state when drawer closes
  const [cameraKey, setCameraKey] = useState(0);

  const handleBatchAnalysis = async (imageDatas: string[]) => {
    setIsProcessing(true);
    
    // 1. Analyze Batch
    const analyses = await analyzeImages(imageDatas);
    
    // 2. Create Records (map back to images by index)
    const newScans: ScanResult[] = analyses.map((analysis, idx) => ({
      id: uuidv4(),
      timestamp: Date.now(),
      imageUrl: imageDatas[idx] || imageDatas[0], // Fallback if index mismatch
      ...analysis
    }));

    // 3. Save All
    newScans.forEach(scan => saveScan(scan));
    setResults(newScans);
    
    // 4. Show UI
    setIsProcessing(false);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setResults([]);
    // Increment key to reset camera (clear batch queue)
    setCameraKey(prev => prev + 1);
  };

  return (
    <div className="h-[100dvh] w-full relative bg-black overflow-hidden">
      {/* Install Prompt for Web Users */}
      <InstallPrompt />

      {/* Background Camera Layer */}
      <div className="absolute inset-0 z-0">
        <Camera key={cameraKey} onAnalyze={handleBatchAnalysis} isProcessing={isProcessing} />
      </div>
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium animate-pulse">Scanning Batch...</p>
          <p className="text-gray-400 text-sm mt-2">Analyzing ingredients & safety</p>
        </div>
      )}

      {/* Result Drawer */}
      <ResultDrawer 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer} 
        results={results} 
      />

      {/* NavBar (Fixed Bottom) */}
      {!isProcessing && !isDrawerOpen && <NavBar />}
    </div>
  );
};
