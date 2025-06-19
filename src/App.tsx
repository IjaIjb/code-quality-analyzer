import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CodeAnalyzer from './components/CodeAnalyzer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main analyzer route */}
          <Route path="/" element={<CodeAnalyzer />} />
          <Route path="/analyzer" element={<CodeAnalyzer />} />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;