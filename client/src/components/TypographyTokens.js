import React from 'react';
import './TypographyTokens.css';

function TypographyTokens({ typography }) {
  return (
    <div className="typography-tokens">
      <div className="typography-section">
        <h3>📚 Font Families</h3>
        <div className="font-families">
          {typography.fontFamilies?.map((font, index) => (
            <div key={index} className="font-family-card">
              <div className="font-preview" style={{ fontFamily: font.value }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="font-info">
                <span className="font-name">{font.name}</span>
                <span className="font-value">{font.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="typography-section">
        <h3>📏 Font Sizes</h3>
        <div className="font-sizes">
          {typography.fontSizes?.map((size, index) => (
            <div key={index} className="font-size-card">
              <div
                className="size-preview"
                style={{ fontSize: size.value || size }}
              >
                Aa
              </div>
              <div className="size-info">
                <span className="size-name">{size.name || size.semanticName || `Size ${index + 1}`}</span>
                <span className="size-value">{size.value || size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="typography-section">
        <h3>💪 Font Weights</h3>
        <div className="font-weights">
          {typography.fontWeights?.map((weight, index) => (
            <div key={index} className="font-weight-card">
              <div
                className="weight-preview"
                style={{ fontWeight: weight.value || weight }}
              >
                The quick brown fox
              </div>
              <div className="weight-info">
                <span className="weight-name">{weight.name || `Weight ${weight.value || weight}`}</span>
                <span className="weight-value">{weight.value || weight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {typography.lineHeights && typography.lineHeights.length > 0 && (
        <div className="typography-section">
          <h3>📐 Line Heights</h3>
          <div className="line-heights">
            {typography.lineHeights.map((height, index) => (
              <div key={index} className="line-height-card">
                <div
                  className="line-height-preview"
                  style={{ lineHeight: height.value || height }}
                >
                  <p>Line one of text</p>
                  <p>Line two of text</p>
                  <p>Line three of text</p>
                </div>
                <div className="line-height-info">
                  <span className="line-height-name">{height.name || `Line Height ${index + 1}`}</span>
                  <span className="line-height-value">{height.value || height}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TypographyTokens;
