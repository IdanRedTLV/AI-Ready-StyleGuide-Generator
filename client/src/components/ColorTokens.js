import React from 'react';
import './ColorTokens.css';

function ColorTokens({ colors }) {
  const renderColorGroup = (title, colorArray, icon) => {
    if (!colorArray || colorArray.length === 0) return null;

    return (
      <div className="color-group">
        <h3>{icon} {title}</h3>
        <div className="color-grid">
          {colorArray.map((color, index) => (
            <div key={index} className="color-card">
              <div
                className="color-swatch"
                style={{ backgroundColor: color.value }}
                title={color.value}
              ></div>
              <div className="color-info">
                <span className="color-name">{color.name}</span>
                <span className="color-value">{color.value}</span>
                {color.hsl && (
                  <span className="color-hsl">{color.hsl}</span>
                )}
              </div>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(color.value);
                }}
                title="Copy color value"
              >
                📋
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="color-tokens">
      {renderColorGroup('Primary Colors', colors.primary, '⭐')}
      {renderColorGroup('Secondary Colors', colors.secondary, '✨')}
      {renderColorGroup('Neutral Colors', colors.neutral, '⚪')}

      {colors.semantic && (
        <>
          {renderColorGroup('Success Colors', colors.semantic.success, '✅')}
          {renderColorGroup('Warning Colors', colors.semantic.warning, '⚠️')}
          {renderColorGroup('Error Colors', colors.semantic.error, '❌')}
          {renderColorGroup('Info Colors', colors.semantic.info, 'ℹ️')}
        </>
      )}
    </div>
  );
}

export default ColorTokens;
