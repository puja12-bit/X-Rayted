import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { ResultDetail } from './pages/ResultDetail';

// Polyfill for uuid if needed or ensure types are consistent
// App Structure using HashRouter for PWA compatibility on static hosts
const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="antialiased text-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/result/:id" element={<ResultDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
