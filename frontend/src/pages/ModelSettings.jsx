import React, { useState } from 'react';
import { Settings2, Server, Power, RefreshCw, CheckCircle2, AlertCircle, DownloadCloud, HardDrive } from 'lucide-react';
import './ModelSettings.css';

const ModelSettings = ({ models, toggleModelActive, refreshModels }) => {
  const [endpoint, setEndpoint] = useState('http://localhost:11434');
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'none', 'testing', 'connected', 'error'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullModelName, setPullModelName] = useState('');

  const handleTestConnection = (e) => {
    e.preventDefault();
    setConnectionStatus('testing');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 1500);
  };

  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    if (refreshModels) {
      await refreshModels();
    }
    setIsRefreshing(false);
  };

  const handlePullModel = (e) => {
    e.preventDefault();
    if (!pullModelName.trim()) return;
    
    // Simulate pulling a new model
    alert(`Ollama 서버에 '${pullModelName}' 모델 다운로드를 요청했습니다. 백그라운드에서 진행됩니다.`);
    setPullModelName('');
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <h2>Ollama Model Settings</h2>
        <p className="page-desc">Configure your local Ollama server connection and manage active sLLMs.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column: Server Connection */}
        <div className="settings-column">
          <div className="settings-card glass-panel">
            <div className="card-header">
              <Server className="accent-icon" />
              <h3>Server Connection</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleTestConnection} className="server-form">
                <div className="form-group">
                  <label>Ollama API Endpoint</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
                
                <div className="connection-status-box">
                  {connectionStatus === 'connected' && (
                    <div className="status-message success">
                      <CheckCircle2 size={18} />
                      <span>Connected to Ollama server successfully.</span>
                    </div>
                  )}
                  {connectionStatus === 'testing' && (
                    <div className="status-message warning">
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Testing connection...</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="status-message danger">
                      <AlertCircle size={18} />
                      <span>Failed to connect. Check if Ollama is running.</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary full-width">
                  <Power size={16} /> Test Connection
                </button>
              </form>
            </div>
          </div>

          <div className="settings-card glass-panel mt-4">
            <div className="card-header">
              <DownloadCloud className="accent-icon" />
              <h3>Pull New Model</h3>
            </div>
            <div className="card-body">
              <p className="helper-text mb-4">Download a new model from the Ollama registry (e.g., 'llama3', 'mistral', 'llava').</p>
              <form onSubmit={handlePullModel} className="pull-form">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter model name..."
                  value={pullModelName}
                  onChange={(e) => setPullModelName(e.target.value)}
                />
                <button type="submit" className="btn-secondary" disabled={!pullModelName.trim()}>
                  Pull
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Local Models */}
        <div className="settings-column flex-2">
          <div className="settings-card glass-panel full-height">
            <div className="card-header border-bottom">
              <div className="header-title-flex">
                <HardDrive className="accent-icon" />
                <h3>Local Models ({models.length})</h3>
              </div>
              <button 
                className="btn-icon-action" 
                onClick={handleRefreshModels}
                title="Refresh models from Ollama"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="card-body no-padding">
              <div className="model-list">
                {models.map(model => (
                  <div key={model.id} className="model-item">
                    <div className="model-info">
                      <div className="model-title">
                        <h4>{model.name}</h4>
                        <span className="model-tag">{model.family}</span>
                      </div>
                      <div className="model-meta">
                        <span>ID: {model.id}</span>
                        <span className="dot-separator">•</span>
                        <span>Size: {model.size}</span>
                      </div>
                    </div>
                    <div className="model-actions">
                      <span className={`status-label ${model.active ? 'active' : 'inactive'}`}>
                        {model.active ? 'Dashboard Active' : 'Hidden'}
                      </span>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={model.active} 
                          onChange={() => toggleModelActive(model.id)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSettings;
