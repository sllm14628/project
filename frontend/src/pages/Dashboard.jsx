import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Loader2, Clock } from 'lucide-react';
import './Dashboard.css';

const formatTime = (date) => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
};

const Dashboard = ({ activeModels }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'user', 
      text: '스트리밍 테스트 준비가 되었습니다. 자유롭게 대화를 시작해 보세요!', 
      timestamp: formatTime(new Date()) 
    }
  ]);

  const messagesEndRefs = useRef([]);

  const scrollToBottom = () => {
    messagesEndRefs.current.forEach(ref => {
      if (ref) ref.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || activeModels.length === 0) return;
    
    const now = new Date();
    // 사용자 메시지 기록
    const userMessage = { 
      id: Date.now(), 
      type: 'user', 
      text: input,
      timestamp: formatTime(now)
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    
    // 각 모델별 로딩 상태 (Placeholders) 생성
    const loadingMessages = activeModels.map((model, index) => ({
      id: Date.now() + index + 1,
      type: 'model',
      modelName: model.name,
      modelId: model.id,
      text: '',
      isLoading: true,
      isStreaming: false,
      startTime: Date.now(), // 요청 시작 시간
      endTime: null,
      duration: null,
    }));
    
    setMessages(prev => [...prev, ...loadingMessages]);

    // 각 활성화된 모델로 비동기 동시 요청
    loadingMessages.forEach(async (msgStub) => {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // stream: true 설정으로 스트리밍 활성화
          body: JSON.stringify({ model: msgStub.modelId, prompt: currentInput, stream: true })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // 스트림 읽기 준비
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = '';
        
        // 로딩 종료 -> 스트리밍 시작 상태로 전환
        setMessages(prev => prev.map(msg => 
          msg.id === msgStub.id ? { ...msg, isLoading: false, isStreaming: true } : msg
        ));

        // 스트림 데이터 청크(Chunk) 단위로 읽어오기
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                fullText += parsed.response;
                // UI 실시간 업데이트
                setMessages(prev => prev.map(msg => 
                  msg.id === msgStub.id ? { ...msg, text: fullText } : msg
                ));
              }
            } catch (e) {
              console.error("JSON 파싱 에러:", line, e);
            }
          }
        }
        
        // 스트리밍 종료 -> 소요 시간 계산
        const endTime = Date.now();
        const duration = ((endTime - msgStub.startTime) / 1000).toFixed(2); // 초 단위 변환
        
        setMessages(prev => prev.map(msg => 
          msg.id === msgStub.id 
            ? { ...msg, isStreaming: false, endTime, duration } 
            : msg
        ));
        
      } catch (error) {
        setMessages(prev => prev.map(msg => 
          msg.id === msgStub.id 
            ? { ...msg, text: `Error: 통신 실패. Ollama가 켜져 있는지 확인하세요.\n\n상세: ${error.message}`, isLoading: false, isStreaming: false } 
            : msg
        ));
      }
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header glass-panel">
        <div className="header-title">
          <Sparkles className="accent-icon" />
          <h2>Model Comparison ({activeModels.length} Models Active)</h2>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-grid">
          {activeModels.map((model, index) => (
            <div key={model.id} className="chat-column glass-panel">
              <div className="column-header">
                <Bot size={18} />
                <h3>{model.name}</h3>
              </div>
              <div className="message-list">
                {messages.filter(m => m.type === 'user' || m.modelName === model.name).map((msg) => (
                  <div key={msg.id} className={`message-wrapper-outer ${msg.type}`}>
                    <div className={`message-wrapper ${msg.type}`}>
                      <div className={`message-bubble ${msg.type} ${msg.isLoading ? 'loading' : ''}`}>
                        {msg.type === 'user' ? <User size={16} className="msg-icon" /> : <Bot size={16} className="msg-icon" />}
                        <div className="msg-text">
                          {msg.isLoading ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                              <Loader2 size={16} className="animate-spin" style={{animation: 'spin 1s linear infinite'}} /> 
                              <span>연결 중...</span>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    </div>
                    {/* 메타데이터 (시간 정보) */}
                    {msg.type === 'user' && (
                      <div className="message-meta user-meta">{msg.timestamp}</div>
                    )}
                    {msg.type === 'model' && !msg.isLoading && (
                      <div className="message-meta model-meta">
                        {msg.isStreaming ? (
                           <span className="streaming-indicator"><Loader2 size={12} className="animate-spin" style={{animation: 'spin 1s linear infinite'}} /> 생성 중...</span>
                        ) : (
                           <span className="duration-indicator"><Clock size={12} /> {msg.duration}s 소요됨</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={el => messagesEndRefs.current[index] = el} />
              </div>
            </div>
          ))}
          {activeModels.length === 0 && (
            <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
              Settings 메뉴에서 모델을 하나 이상 활성화해 주세요.
            </div>
          )}
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
            placeholder={activeModels.length > 0 ? `모든 활성화된 모델(${activeModels.length}개)에게 질문을 입력하세요...` : "모델을 먼저 활성화해 주세요."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={activeModels.length === 0}
          />
          <button type="submit" className="btn-send" disabled={!input.trim() || activeModels.length === 0}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
