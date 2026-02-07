import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminPage } from './pages/AdminPage';
import { SuccessPage } from './pages/SuccessPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;