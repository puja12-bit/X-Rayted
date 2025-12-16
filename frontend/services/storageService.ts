import { ScanResult } from '../types';

const STORAGE_KEY = 'label_scan_history_v1';

export const saveScan = (scan: ScanResult): void => {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const history: ScanResult[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    // Prepend new scan
    const updatedHistory = [scan, ...history];
    
    // Limit to last 50 to prevent localStorage overflow with base64 images
    if (updatedHistory.length > 50) {
      updatedHistory.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save scan", error);
  }
};

export const getHistory = (): ScanResult[] => {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};

export const getScanById = (id: string): ScanResult | undefined => {
  const history = getHistory();
  return history.find(item => item.id === id);
};
