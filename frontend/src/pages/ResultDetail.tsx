
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScanById } from '../services/storageService';
import { ScanResult } from '../types';
import { ScanDetailView } from '../components/ScanDetailView';

export const ResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (id) {
      const data = getScanById(id);
      if (data) setScan(data);
    }
  }, [id]);

  if (!scan) return <div className="p-8 text-center text-gray-500 pt-20">Scan not found.</div>;

  return (
    <div className="min-h-[100dvh] bg-surface">
      <ScanDetailView 
        scan={scan} 
        onBack={() => navigate('/history')}
        backLabel="History" 
      />
    </div>
  );
};
