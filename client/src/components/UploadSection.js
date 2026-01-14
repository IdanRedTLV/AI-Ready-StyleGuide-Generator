import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './UploadSection.css';

function UploadSection({ onAnalysisComplete, onAnalysisStart, onError }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      onError('Please upload at least one screenshot');
      return;
    }

    onAnalysisStart();

    const formData = new FormData();
    files.forEach(file => {
      formData.append('screenshots', file);
    });

    try {
      const response = await axios.post('http://localhost:5001/api/analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const figmaResponse = await axios.post('http://localhost:5001/api/figma/generate', {
          designTokens: response.data.designTokens,
          componentLibrary: response.data.componentLibrary,
          projectName: 'AI-Generated Style Guide'
        });

        onAnalysisComplete({
          ...response.data,
          figmaOutput: figmaResponse.data.figmaOutput
        });

        setFiles([]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      onError(error.response?.data?.error || 'Failed to analyze screenshots. Please try again.');
    }
  };

  return (
    <div className="upload-section">
      <div
        className={`dropzone ${dragActive ? 'active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {files.length === 0 ? (
          <div className="dropzone-content">
            <div className="upload-icon">📸</div>
            <h3>Drop UI Screenshots Here</h3>
            <p>or click to browse files</p>
            <label htmlFor="file-input" className="btn btn-primary">
              Choose Files
            </label>
            <p className="file-info">Supports: JPG, PNG, GIF, WebP (Max 10MB each)</p>
          </div>
        ) : (
          <div className="files-preview">
            <h3>📁 {files.length} file{files.length !== 1 ? 's' : ''} selected</h3>
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info-compact">
                    <span className="file-icon">🖼️</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="upload-actions">
              <label htmlFor="file-input" className="btn btn-secondary">
                Add More Files
              </label>
              <button
                className="btn btn-primary btn-analyze"
                onClick={handleAnalyze}
              >
                Analyze & Generate Style Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadSection;
