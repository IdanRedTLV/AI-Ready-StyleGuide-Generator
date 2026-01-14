import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">
        <h3>Analyzing Your UI Screenshots...</h3>
        <p>Our AI is extracting design tokens and components</p>
        <div className="loading-steps">
          <div className="step">🔍 Detecting UI components</div>
          <div className="step">🎨 Extracting colors & typography</div>
          <div className="step">📏 Analyzing spacing & layout</div>
          <div className="step">🧩 Generating component library</div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
