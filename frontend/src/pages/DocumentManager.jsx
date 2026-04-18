import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, Clock, AlertCircle, File as FileIcon } from 'lucide-react';
import './DocumentManager.css';

const INITIAL_DOCS = [
  { id: 1, name: '사내_인사규정_2026.pdf', size: '2.4 MB', date: '2026-04-18 10:30', status: 'completed' },
  { id: 2, name: '제품_매뉴얼_v3.txt', size: '156 KB', date: '2026-04-17 14:20', status: 'completed' },
  { id: 3, name: '기술_아키텍처_설계서.pdf', size: '5.1 MB', date: '2026-04-18 14:50', status: 'processing' },
  { id: 4, name: '손상된_데이터.csv', size: '42 KB', date: '2026-04-16 09:10', status: 'failed' }
];

const DocumentManager = () => {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const simulateUpload = (fileNames) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          const newDocs = fileNames.map((name, idx) => ({
            id: Date.now() + idx,
            name: name,
            size: 'Unknown',
            date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0,5),
            status: 'processing'
          }));
          setDocuments([...newDocs, ...documents]);
        }, 500);
      }
    }, 200);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileNames = Array.from(e.dataTransfer.files).map(f => f.name);
      simulateUpload(fileNames);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name);
      simulateUpload(fileNames);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('이 문서를 삭제하면 RAG 검색에서 제외됩니다. 계속하시겠습니까?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const renderStatus = (status) => {
    switch(status) {
      case 'completed':
        return <span className="status-badge success"><CheckCircle2 size={14} /> 임베딩 완료</span>;
      case 'processing':
        return <span className="status-badge warning"><Clock size={14} className="animate-spin-slow" /> 처리 중</span>;
      case 'failed':
        return <span className="status-badge danger"><AlertCircle size={14} /> 실패</span>;
      default:
        return null;
    }
  };

  return (
    <div className="doc-manager-container">
      <div className="page-header">
        <h2>Document Knowledge Base</h2>
        <p className="page-desc">Upload documents (PDF, TXT, CSV) to enhance the LLM's knowledge using RAG.</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`upload-zone glass-panel ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect}
        />
        
        {!isUploading ? (
          <div className="upload-content">
            <div className="upload-icon-wrapper">
              <UploadCloud size={48} className="upload-icon" />
            </div>
            <h3>Click or drag files to this area to upload</h3>
            <p>Support for a single or bulk upload. Strictly prohibited from uploading company sensitive data.</p>
          </div>
        ) : (
          <div className="uploading-content">
            <FileIcon size={36} className="uploading-icon pulse" />
            <h3>Uploading Files...</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>{uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Document List Table */}
      <div className="doc-list-panel glass-panel">
        <div className="panel-header">
          <h3>Uploaded Documents ({documents.length})</h3>
        </div>
        <div className="table-responsive">
          <table className="doc-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th className="align-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map(doc => (
                  <tr key={doc.id} className="animate-fade-in">
                    <td>
                      <div className="file-name-cell">
                        <FileText size={16} className="file-icon" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{doc.size}</td>
                    <td className="text-muted">{doc.date}</td>
                    <td>{renderStatus(doc.status)}</td>
                    <td className="align-right">
                      <button 
                        className="btn-icon-action danger" 
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">No documents uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
