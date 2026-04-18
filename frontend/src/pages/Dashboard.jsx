import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Paperclip } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ activeModels }) => {
  const [input, setInput] = useState('');
  
  // App.jsx에서 전달받은 활성화된 모델 리스트
  const availableModels = activeModels;
  
  const [messages, setMessages] = useState([
    { id: 1, type: 'user', text: 'RAG 시스템의 주요 장점이 무엇인가요?' },
    { 
      id: 2, 
      type: 'model', 
      modelName: 'Llama 3 (8B)',
      text: 'RAG(검색 증강 생성) 시스템은 모델 재학습 없이도 최신 지식을 검색하여 신뢰성 있는 답변을 생성합니다.'
    },
    { 
      id: 3, 
      type: 'model', 
      modelName: 'Mistral (v0.3)',
      text: '비용 효율성과 도메인 특화 문서 기반의 정확한 답변 제공이 주요 장점입니다.'
    },
    { 
      id: 4, 
      type: 'model', 
      modelName: 'Qwen 1.5',
      text: '할루시네이션(환각) 현상을 최소화하고 정보의 출처를 사용자에게 제공할 수 있는 점이 돋보입니다.'
    },
    { 
      id: 5, 
      type: 'model', 
      modelName: 'Gemma (7B)',
      text: '검색된 문맥을 바탕으로 답변을 제한하므로 기업 내부 규정이나 민감한 정보 보호에 유리합니다.'
    }
  ]);

  // 각 컬럼의 스크롤을 하단으로 유지하기 위한 Ref 배열
  const messagesEndRefs = useRef([]);

  const scrollToBottom = () => {
    messagesEndRefs.current.forEach(ref => {
      if (ref) ref.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const newMessage = { id: Date.now(), type: 'user', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Simulate model responses for ALL models
    setTimeout(() => {
      const newResponses = availableModels.map((model, index) => ({
        id: Date.now() + index + 1,
        type: 'model',
        modelName: model,
        text: `${model}의 분석 결과:\n\n요청하신 "${input}"에 대해 문서를 기반으로 처리한 내용입니다.`
      }));
      setMessages(prev => [...prev, ...newResponses]);
    }, 1000);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header glass-panel">
        <div className="header-title">
          <Sparkles className="accent-icon" />
          <h2>Model Comparison ({availableModels.length} Models Active)</h2>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-grid">
          {availableModels.map((model, index) => (
            <div key={model} className="chat-column glass-panel">
              <div className="column-header">
                <Bot size={18} />
                <h3>{model}</h3>
              </div>
              <div className="message-list">
                {messages.filter(m => m.type === 'user' || m.modelName === model).map((msg) => (
                  <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                    <div className={`message-bubble ${msg.type}`}>
                      {msg.type === 'user' ? <User size={16} className="msg-icon" /> : <Bot size={16} className="msg-icon" />}
                      <div className="msg-text">{msg.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={el => messagesEndRefs.current[index] = el} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area glass-panel">
        <form onSubmit={handleSubmit} className="input-form">
          <button type="button" className="btn-icon" title="문서 첨부">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder={`모든 활성화된 모델(${availableModels.length}개)에게 질문을 입력하세요...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-send" disabled={!input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
