import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TemplateManager from './pages/TemplateManager';
import DocumentManager from './pages/DocumentManager';
import ModelSettings from './pages/ModelSettings';

function App() {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) throw new Error('Ollama API 연결 실패');
      const data = await response.json();
      
      const fetchedModels = data.models.map((m, index) => {
        // 이름을 보기 좋게 포맷팅 (예: qwen3.5:latest -> Qwen3.5 (latest))
        const parts = m.name.split(':');
        const displayName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + (parts[1] ? ` (${parts[1]})` : '');
        
        return {
          id: m.name,
          name: displayName,
          size: (m.size / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
          family: m.details?.family || 'unknown',
          active: index < 4 // 기본적으로 앞의 4개 모델을 활성화
        };
      });
      
      setModels(fetchedModels);
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
      // Ollama에 직접 접근할 수 없을 경우 (CORS 등) 사용자에게 안내
      setModels([
        { id: 'error', name: 'Ollama 연결 오류', size: '0 GB', family: 'error', active: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const toggleModelActive = (id) => {
    setModels(models.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const activeModels = models.filter(m => m.active && m.id !== 'error');

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {isLoading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Ollama에서 모델 목록을 불러오는 중...
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard activeModels={activeModels} />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/documents" element={<DocumentManager />} />
              <Route path="/settings" element={<ModelSettings models={models} toggleModelActive={toggleModelActive} refreshModels={fetchModels} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
