import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Save, X } from 'lucide-react';
import './TemplateManager.css';

const INITIAL_TEMPLATES = [
  {
    id: 1,
    title: '기본 RAG 봇',
    description: '주어진 컨텍스트를 바탕으로 정확하고 간결하게 답변합니다.',
    prompt: '당신은 도움이 되는 AI 어시스턴트입니다.\n다음 정보({context})를 바탕으로 질문({question})에 답변해 주세요.\n정보에 없는 내용은 지어내지 마세요.',
    updatedAt: '2026-04-18',
  },
  {
    id: 2,
    title: '상세 분석가',
    description: '문서의 주요 내용을 길고 상세하게 분석하여 요약합니다.',
    prompt: '당신은 전문 분석가입니다. 제공된 문서({context})를 꼼꼼히 읽고 사용자의 질문({question})에 대해 최대한 상세하고 전문적인 용어를 사용하여 심층적으로 답변하세요.',
    updatedAt: '2026-04-17',
  }
];

const TemplateManager = () => {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', prompt: '' });

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newTemplate = {
      id: Date.now(),
      title: '새 템플릿',
      description: '템플릿 설명을 입력하세요.',
      prompt: '여기에 시스템 프롬프트를 작성하세요. {context}와 {question} 변수를 사용할 수 있습니다.',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSelectedTemplate(newTemplate);
    setEditForm(newTemplate);
    setIsEditing(true);
  };

  const handleEdit = () => {
    setEditForm(selectedTemplate);
    setIsEditing(true);
  };

  const handleSave = () => {
    const isNew = !templates.find(t => t.id === editForm.id);
    const updatedTemplate = { ...editForm, updatedAt: new Date().toISOString().split('T')[0] };
    
    if (isNew) {
      setTemplates([updatedTemplate, ...templates]);
    } else {
      setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    }
    
    setSelectedTemplate(updatedTemplate);
    setIsEditing(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
      setTemplates(templates.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="template-container">
      {/* Left List Pane */}
      <div className="template-list-pane glass-panel">
        <div className="pane-header">
          <div className="header-title">
            <FileText className="accent-icon" />
            <h2>Prompt Templates</h2>
          </div>
          <button className="btn-primary btn-sm" onClick={handleCreateNew}>
            <Plus size={16} /> New
          </button>
        </div>

        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="template-list">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className={`template-card ${selectedTemplate?.id === template.id ? 'active' : ''}`}
              onClick={() => handleSelect(template)}
            >
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              <div className="template-meta">
                <span>Updated: {template.updatedAt}</span>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="empty-state">No templates found.</div>
          )}
        </div>
      </div>

      {/* Right Editor Pane */}
      <div className="template-editor-pane glass-panel">
        {selectedTemplate ? (
          <div className="editor-content animate-fade-in">
            <div className="pane-header border-bottom">
              <h2>{isEditing ? 'Edit Template' : 'Template Details'}</h2>
              <div className="action-buttons">
                {!isEditing ? (
                  <>
                    <button className="btn-icon-action" onClick={handleEdit}><Edit2 size={18} /></button>
                    <button className="btn-icon-action danger" onClick={() => handleDelete(selectedTemplate.id)}><Trash2 size={18} /></button>
                  </>
                ) : (
                  <>
                    <button className="btn-icon-action" onClick={() => setIsEditing(false)}><X size={18} /></button>
                    <button className="btn-primary btn-sm" onClick={handleSave}><Save size={16} /> Save</button>
                  </>
                )}
              </div>
            </div>

            <div className="editor-form">
              <div className="form-group">
                <label>Template Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="read-only-value title">{selectedTemplate.title}</div>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.description} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="read-only-value">{selectedTemplate.description}</div>
                )}
              </div>

              <div className="form-group flex-1">
                <label>
                  System Prompt
                  <span className="helper-text">Use <span className="highlight-var">{`{context}`}</span> for retrieved documents and <span className="highlight-var">{`{question}`}</span> for user input.</span>
                </label>
                {isEditing ? (
                  <textarea 
                    value={editForm.prompt} 
                    onChange={e => setEditForm({...editForm, prompt: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter prompt here..."
                  />
                ) : (
                  <div className="read-only-value prompt-box">
                    {selectedTemplate.prompt.split(/(\{context\}|\{question\})/g).map((part, i) => {
                      if (part === '{context}' || part === '{question}') {
                        return <span key={i} className="highlight-var">{part}</span>;
                      }
                      return part;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-selection">
            <FileText size={48} className="empty-icon" />
            <h3>No Template Selected</h3>
            <p>Select a template from the list or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
