import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TemplateManager from './pages/TemplateManager';
import DocumentManager from './pages/DocumentManager';
import ModelSettings from './pages/ModelSettings';

const MOCK_OLLAMA_MODELS = [
  { id: 'llama3:8b', name: 'Llama 3 (8B)', size: '4.7 GB', family: 'llama', active: true },
  { id: 'mistral:latest', name: 'Mistral (v0.3)', size: '4.1 GB', family: 'mistral', active: true },
  { id: 'qwen:1.5b', name: 'Qwen 1.5', size: '1.2 GB', family: 'qwen', active: true },
  { id: 'gemma:7b', name: 'Gemma (7B)', size: '5.0 GB', family: 'gemma', active: true },
  { id: 'phi3:mini', name: 'Phi-3 (Mini)', size: '2.3 GB', family: 'phi3', active: false },
];

function App() {
  const [models, setModels] = useState(MOCK_OLLAMA_MODELS);

  const toggleModelActive = (id) => {
    setModels(models.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const activeModels = models.filter(m => m.active).map(m => m.name);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard activeModels={activeModels} />} />
            <Route path="/templates" element={<TemplateManager />} />
            <Route path="/documents" element={<DocumentManager />} />
            <Route path="/settings" element={<ModelSettings models={models} toggleModelActive={toggleModelActive} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
