# 🎨 AI-Ready StyleGuide Generator

Transform UI screenshots into machine-readable Figma style guides with AI-powered analysis. Generate design tokens, component libraries, and semantic naming conventions automatically.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## ✨ Features

- 🤖 **AI-Powered Analysis**: Uses Claude Vision API to analyze UI screenshots
- 🎨 **Design Token Extraction**: Automatically extracts colors, typography, spacing, shadows, and border radius
- 🧩 **Component Detection**: Identifies buttons, inputs, cards, navigation, modals, and more
- 📐 **Auto Layout Support**: Generates clean, non-overlapping frame structures
- 🏷️ **Semantic Naming**: Creates AI-readable names like "Button/Primary", "Input/TextField"
- 📦 **Multiple Export Formats**: CSS, SCSS, JSON, JavaScript
- 🎯 **Machine-Readable Output**: Structured for AI consumption and code generation
- 🔄 **Component Variants**: Automatically generates states (hover, active, disabled) and sizes

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key (for Claude Vision)
- Optional: Figma API token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AI-Ready-StyleGuide-Generator.git
   cd AI-Ready-StyleGuide-Generator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   FIGMA_ACCESS_TOKEN=your_figma_token_here
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

## 📖 Usage

### 1. Upload Screenshots

1. Open the app at `http://localhost:3000`
2. Drag and drop UI screenshots or click to browse
3. Upload multiple screenshots for comprehensive analysis

### 2. AI Analysis

The app will automatically:
- Detect UI components (buttons, inputs, cards, etc.)
- Extract design tokens (colors, typography, spacing)
- Identify component states and variants
- Generate semantic naming conventions

### 3. View Results

Navigate through tabs to see:
- **Colors**: Primary, secondary, neutral, and semantic colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Spacing scale and patterns
- **Components**: Complete component library with variants
- **Export**: Download design tokens in multiple formats

### 4. Export

Choose from multiple export formats:
- **JSON**: Standard JSON format for APIs
- **CSS**: CSS custom properties (variables)
- **SCSS**: Sass variables
- **JavaScript**: ES6 module exports

## 🎯 Design System Output

### Design Tokens Structure

```json
{
  "colors": {
    "primary": [
      {
        "name": "primary-1",
        "value": "#667eea",
        "hsl": "hsl(232, 77%, 65%)"
      }
    ],
    "semantic": {
      "success": [...],
      "error": [...],
      "warning": [...]
    }
  },
  "typography": {
    "fontFamilies": [...],
    "fontSizes": [...],
    "fontWeights": [...]
  },
  "spacing": {
    "scale": [...],
    "patterns": {...}
  }
}
```

### Component Library Structure

```json
{
  "name": "Button/Primary",
  "type": "Button",
  "variants": [
    {
      "name": "Button/Primary/Default",
      "properties": {
        "state": "default",
        "size": "md"
      }
    }
  ],
  "autoLayout": {
    "enabled": true,
    "direction": "horizontal",
    "spacing": 8,
    "padding": { "top": 8, "right": 16, "bottom": 8, "left": 16 }
  },
  "semanticName": "Button/Primary"
}
```

## 🏗️ Architecture

### Backend (Node.js/Express)

```
server/
├── index.js                 # Express server setup
├── routes/
│   ├── analysis.js         # Screenshot analysis endpoints
│   └── figma.js            # Figma generation endpoints
└── services/
    ├── analysisService.js  # AI vision analysis
    ├── designTokenService.js # Token extraction
    └── figmaService.js     # Figma output generation
```

### Frontend (React)

```
client/src/
├── App.js                  # Main app component
├── components/
│   ├── Header.js           # App header
│   ├── UploadSection.js    # File upload interface
│   ├── LoadingSpinner.js   # Loading state
│   ├── ResultsSection.js   # Results display
│   ├── ColorTokens.js      # Color token display
│   ├── TypographyTokens.js # Typography display
│   ├── ComponentLibrary.js # Component library
│   └── ExportPanel.js      # Export functionality
└── index.js                # App entry point
```

## 🔧 API Reference

### POST /api/analysis

Analyze uploaded screenshots and extract design information.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `screenshots` (files)

**Response:**
```json
{
  "success": true,
  "screenshotsAnalyzed": 2,
  "designTokens": {...},
  "componentLibrary": {...},
  "analysisResults": [...]
}
```

### POST /api/figma/generate

Generate Figma-ready style guide structure.

**Request:**
```json
{
  "designTokens": {...},
  "componentLibrary": {...},
  "projectName": "My Style Guide"
}
```

**Response:**
```json
{
  "success": true,
  "figmaOutput": {
    "projectName": "...",
    "tokens": {...},
    "components": [...],
    "figma": {...}
  }
}
```

### POST /api/figma/export-tokens

Export design tokens in various formats.

**Request:**
```json
{
  "designTokens": {...},
  "format": "css"
}
```

**Response:**
```json
{
  "success": true,
  "format": "css",
  "tokens": "/* CSS Variables */"
}
```

## 🎨 Best Practices for Screenshots

For optimal results:

1. **High Quality**: Upload clear, high-resolution screenshots
2. **Complete Views**: Include entire components, not cropped sections
3. **Multiple States**: Upload different states (hover, active, disabled)
4. **Variety**: Include diverse components (buttons, forms, cards, etc.)
5. **Consistent Lighting**: Use screenshots with similar brightness/contrast

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Powered by [Anthropic Claude Vision API](https://www.anthropic.com/)
- Inspired by design system best practices
- Built for the AI-assisted design era

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com

## 🗺️ Roadmap

- [ ] Direct Figma plugin integration
- [ ] Support for video/animated UI analysis
- [ ] Custom design token templates
- [ ] AI-powered component code generation
- [ ] Integration with Storybook
- [ ] Dark mode detection
- [ ] Accessibility analysis (WCAG compliance)

---

Made with ❤️ for designers and developers building AI-ready design systems
