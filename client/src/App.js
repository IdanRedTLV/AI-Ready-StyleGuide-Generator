import React, { useState } from 'react';
import './App.css';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (data) => {
    setResults(data);
    setLoading(false);
    setError(null);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
    setResults(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="App">
      <Header />

      <main className="container">
        {!results && !loading && (
          <div className="intro-section">
            <h2>Transform UI Screenshots into AI-Ready Design Systems</h2>
            <p>
              Upload your UI screenshots and let AI analyze them to generate a
              machine-readable Figma style guide with design tokens, components,
              and semantic naming conventions.
            </p>
            <div className="features">
              <div className="feature">
                <span className="icon">🎨</span>
                <h3>Design Tokens</h3>
                <p>Colors, typography, spacing, and effects</p>
              </div>
              <div className="feature">
                <span className="icon">🧩</span>
                <h3>Component Library</h3>
                <p>Buttons, inputs, cards with variants</p>
              </div>
              <div className="feature">
                <span className="icon">🤖</span>
                <h3>AI-Powered</h3>
                <p>Machine-readable semantic structure</p>
              </div>
              <div className="feature">
                <span className="icon">📦</span>
                <h3>Export Ready</h3>
                <p>CSS, SCSS, JSON, JavaScript formats</p>
              </div>
            </div>
          </div>
        )}

        <UploadSection
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisStart={handleAnalysisStart}
          onError={handleError}
        />

        {loading && <LoadingSpinner />}

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={handleReset} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {results && !loading && (
          <ResultsSection results={results} onReset={handleReset} />
        )}
      </main>

      <footer className="footer">
        <p>AI-Ready StyleGuide Generator • Powered by Claude Vision API</p>
      </footer>
    </div>
  );
}

export default App;
