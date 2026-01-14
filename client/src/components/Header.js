import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>
          <span className="logo-icon">🎨</span>
          AI-Ready StyleGuide Generator
        </h1>
        <p className="tagline">From Screenshots to Machine-Readable Design Systems</p>
      </div>
    </header>
  );
}

export default Header;
