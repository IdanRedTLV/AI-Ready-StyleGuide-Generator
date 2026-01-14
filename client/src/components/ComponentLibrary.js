import React, { useState } from 'react';
import './ComponentLibrary.css';

function ComponentLibrary({ componentLibrary }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!componentLibrary || !componentLibrary.components) {
    return (
      <div className="component-library">
        <p>No components detected</p>
      </div>
    );
  }

  const categories = componentLibrary.categories || {};
  const allCategories = ['all', ...Object.keys(categories)];

  const filteredComponents = selectedCategory === 'all'
    ? componentLibrary.components
    : componentLibrary.components.filter(comp =>
        categories[selectedCategory]?.includes(comp.name)
      );

  return (
    <div className="component-library">
      <div className="library-header">
        <div className="library-stats">
          <div className="stat">
            <span className="stat-value">{componentLibrary.totalComponents}</span>
            <span className="stat-label">Total Components</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Object.keys(categories).length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>

        <div className="category-filters">
          {allCategories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
              {category !== 'all' && (
                <span className="filter-count">{categories[category]?.length || 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="components-grid">
        {filteredComponents.map((component, index) => (
          <div key={index} className="component-card">
            <div className="component-header">
              <h4>{component.name}</h4>
              <span className="component-type">{component.type}</span>
            </div>

            <div className="component-meta">
              <div className="meta-item">
                <span className="meta-label">Occurrences:</span>
                <span className="meta-value">{component.occurrences}</span>
              </div>
              {component.variants && component.variants.length > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Variants:</span>
                  <span className="meta-value">{component.variants.length}</span>
                </div>
              )}
            </div>

            {component.properties && (
              <div className="component-properties">
                {component.properties.states && (
                  <div className="property-group">
                    <span className="property-label">States:</span>
                    <div className="property-tags">
                      {component.properties.states.map((state, i) => (
                        <span key={i} className="tag tag-state">{state}</span>
                      ))}
                    </div>
                  </div>
                )}
                {component.properties.sizes && (
                  <div className="property-group">
                    <span className="property-label">Sizes:</span>
                    <div className="property-tags">
                      {component.properties.sizes.map((size, i) => (
                        <span key={i} className="tag tag-size">{size}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {component.description && (
              <p className="component-description">{component.description}</p>
            )}

            <div className="semantic-name">
              <span className="semantic-label">🤖 Semantic Name:</span>
              <code>{component.semanticName || component.name}</code>
            </div>
          </div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="no-components">
          <p>No components found in this category</p>
        </div>
      )}
    </div>
  );
}

export default ComponentLibrary;
