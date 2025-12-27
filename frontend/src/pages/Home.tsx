import React, { useState } from 'react';
import { Camera } from '../components/Camera';
import { ResultDrawer } from '../components/ResultDrawer';
import { scanImages } from '../services/apiService';
import { saveScan } from '../services/storageService';
import { ScanResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { NavBar } from '../components/NavBar';
import { InstallPrompt } from '../components/InstallPrompt';

export const Home: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  const handleBatchAnalysis = async (imageDatas: string[]) => {
    try {
      setIsProcessing(true);

      // Convert base64 images → Blobs for backend upload
      const blobs = imageDatas.map((dataUrl) => {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
      });

      // Call backend
      const analyses = await scanImages(blobs);

      // Map backend results back to frontend ScanResult
      const newScans: ScanResult[] = analyses.map((analysis, idx) => ({
        id: uuidv4(),
        timestamp: Date.now(),
        imageUrl: imageDatas[idx] || imageDatas[0],
        ...analysis
      }));

      // Persist locally (history + downloads remain intact)
      newScans.forEach(saveScan);

      setResults(newScans);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Scan failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setResults([]);
    setCameraKey(prev => prev + 1); // reset camera + batch
  };

  return (
    <div className="h-[100dvh] w-full relative bg-black overflow-hidden">
      <InstallPrompt />

      <div className="absolute inset-0 z-0">
        <Camera
          key={cameraKey}
          onAnalyze={handleBatchAnalysis}
          isProcessing={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium animate-pulse">
            Scanning Batch...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Analyzing ingredients & safety
          </p>
        </div>
      )}

      <ResultDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        results={results}
      />

      {!isProcessing && !isDrawerOpen && <NavBar />}
    </div>
  );
};
