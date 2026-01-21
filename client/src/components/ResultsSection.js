import React, { useState } from 'react';
import './ResultsSection.css';
import ColorTokens from './ColorTokens';
import TypographyTokens from './TypographyTokens';
import ComponentLibrary from './ComponentLibrary';
import ExportPanel from './ExportPanel';

function ResultsSection({ results, onReset }) {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: '🎨 Colors', count: results.designTokens?.colors?.primary?.length || 0 },
    { id: 'typography', label: '📝 Typography', count: results.designTokens?.typography?.fontSizes?.length || 0 },
    { id: 'spacing', label: '📏 Spacing', count: results.designTokens?.spacing?.scale?.length || 0 },
    { id: 'components', label: '🧩 Components', count: results.componentLibrary?.totalComponents || 0 },
    { id: 'export', label: '📦 Export', count: null }
  ];

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-title">
          <h2>✨ Style Guide Generated Successfully!</h2>
          <p>Analyzed {results.screenshotsAnalyzed} screenshot(s)</p>
        </div>
        <button onClick={onReset} className="btn btn-secondary">
          Analyze New Screenshots
        </button>
      </div>

      <div className="results-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="results-content">
        {activeTab === 'colors' && (
          <ColorTokens colors={results.designTokens.colors} />
        )}

        {activeTab === 'typography' && (
          <TypographyTokens typography={results.designTokens.typography} />
        )}

        {activeTab === 'spacing' && (
          <div className="spacing-tokens">
            <h3>Spacing Scale</h3>
            <div className="spacing-grid">
              {results.designTokens.spacing.scale?.map((space, index) => (
                <div key={index} className="spacing-item">
                  <div className="spacing-visual" style={{ width: space.value }}></div>
                  <div className="spacing-info">
                    <span className="spacing-name">{space.name}</span>
                    <span className="spacing-value">{space.value} / {space.rem}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3>Spacing Patterns</h3>
            <div className="token-grid">
              {Object.entries(results.designTokens.spacing.patterns || {}).map(([key, value]) => (
                <div key={key} className="token-card">
                  <div className="token-preview" style={{ width: value, height: '40px', background: 'var(--primary-color)' }}></div>
                  <div className="token-info">
                    <span className="token-name">{key}</span>
                    <span className="token-value">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <ComponentLibrary componentLibrary={results.componentLibrary} />
        )}

        {activeTab === 'export' && (
          <ExportPanel
            designTokens={results.designTokens}
            figmaOutput={results.figmaOutput}
            aiReadyDocumentation={results.aiReadyDocumentation}
          />
        )}
      </div>
    </div>
  );
}

export default ResultsSection;
