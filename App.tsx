import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminPage } from './pages/AdminPage';
import { SuccessPage } from './pages/SuccessPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-100 bg-cyber-dark relative selection:bg-cyber-primary selection:text-white">
        {/* Background Grid Effect */}
        <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none z-0"></div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<FormPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;