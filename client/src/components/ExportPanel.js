import React, { useState } from 'react';
import axios from 'axios';
import './ExportPanel.css';

function ExportPanel({ designTokens, figmaOutput }) {
  const [exportFormat, setExportFormat] = useState('json');
  const [exported, setExported] = useState(null);
  const [loading, setLoading] = useState(false);

  const formats = [
    { id: 'json', label: 'JSON', icon: '📄', description: 'Standard JSON format' },
    { id: 'css', label: 'CSS Variables', icon: '🎨', description: 'CSS custom properties' },
    { id: 'scss', label: 'SCSS', icon: '💎', description: 'Sass variables' },
    { id: 'javascript', label: 'JavaScript', icon: '⚡', description: 'ES6 module export' }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/figma/export-tokens', {
        designTokens,
        format: exportFormat
      });

      setExported(response.data.tokens);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (exported) {
      navigator.clipboard.writeText(exported);
      alert('Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!exported) return;

    const extensions = {
      json: 'json',
      css: 'css',
      scss: 'scss',
      javascript: 'js'
    };

    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-tokens.${extensions[exportFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3>📦 Export Design Tokens</h3>
        <p>Choose a format to export your AI-generated design tokens</p>
      </div>

      <div className="format-selector">
        {formats.map(format => (
          <div
            key={format.id}
            className={`format-card ${exportFormat === format.id ? 'active' : ''}`}
            onClick={() => {
              setExportFormat(format.id);
              setExported(null);
            }}
          >
            <span className="format-icon">{format.icon}</span>
            <div className="format-info">
              <h4>{format.label}</h4>
              <p>{format.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="export-actions">
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Exporting...' : `Export as ${formats.find(f => f.id === exportFormat)?.label}`}
        </button>
      </div>

      {exported && (
        <div className="export-result">
          <div className="result-header">
            <h4>✅ Export Complete</h4>
            <div className="result-actions">
              <button className="btn-icon" onClick={handleCopy} title="Copy to clipboard">
                📋 Copy
              </button>
              <button className="btn-icon" onClick={handleDownload} title="Download file">
                💾 Download
              </button>
            </div>
          </div>
          <pre className="code-preview">
            <code>{exported}</code>
          </pre>
        </div>
      )}

      {figmaOutput && (
        <div className="figma-output">
          <h3>🎨 Figma Style Guide Structure</h3>
          <p className="figma-description">
            Below is the machine-readable Figma style guide structure. This includes
            semantic naming, component variants, and design tokens formatted for AI consumption.
          </p>

          <div className="figma-summary">
            <div className="summary-item">
              <span className="summary-label">Project:</span>
              <span className="summary-value">{figmaOutput.projectName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Version:</span>
              <span className="summary-value">{figmaOutput.version}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Generated:</span>
              <span className="summary-value">
                {new Date(figmaOutput.generatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="figma-sections">
            <div className="figma-section">
              <h4>📄 Pages</h4>
              <div className="pages-list">
                {figmaOutput.figma?.pages?.map((page, index) => (
                  <div key={index} className="page-item">
                    <strong>{page.name}</strong>
                    <span className="sections-count">{page.sections?.length} sections</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="figma-section">
              <h4>🎨 Styles</h4>
              <div className="styles-summary">
                <div className="style-count">
                  <span className="count">{figmaOutput.figma?.styles?.colorStyles?.length || 0}</span>
                  <span className="label">Color Styles</span>
                </div>
                <div className="style-count">
                  <span className="count">{figmaOutput.figma?.styles?.textStyles?.length || 0}</span>
                  <span className="label">Text Styles</span>
                </div>
                <div className="style-count">
                  <span className="count">{figmaOutput.figma?.styles?.effectStyles?.length || 0}</span>
                  <span className="label">Effect Styles</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(figmaOutput, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'figma-style-guide.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            💾 Download Complete Figma Structure
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportPanel;
