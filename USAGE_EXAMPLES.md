# 📘 Usage Examples

Real-world examples and use cases for the AI-Ready StyleGuide Generator.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Design Token Extraction](#design-token-extraction)
3. [Component Library Generation](#component-library-generation)
4. [Export Workflows](#export-workflows)
5. [Integration Examples](#integration-examples)
6. [Advanced Use Cases](#advanced-use-cases)

## Basic Usage

### Example 1: Analyze a Single Landing Page

**Scenario**: You have a screenshot of a landing page and want to extract its design system.

**Steps**:
1. Take a screenshot of the landing page
2. Upload to the app
3. Review extracted tokens
4. Export as CSS variables

**Expected Output**:
```css
:root {
  /* Primary Colors */
  --primary-1: #667eea;
  --primary-2: #5a67d8;

  /* Typography */
  --font-size-1: 48px;
  --font-size-2: 32px;
  --font-size-3: 24px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

### Example 2: Multiple Pages Analysis

**Scenario**: Analyze an entire app with multiple screenshots.

**Steps**:
1. Capture screenshots of:
   - Home page
   - Dashboard
   - Settings page
   - Modal dialogs
2. Upload all screenshots together
3. App consolidates design tokens from all pages

**Benefits**:
- More comprehensive color palette
- Better typography detection
- Complete component library

## Design Token Extraction

### Example 3: Color Palette Extraction

**Input**: Screenshot with various colored elements

**Output**:
```json
{
  "colors": {
    "primary": [
      {
        "name": "primary-1",
        "value": "#667eea",
        "hsl": "hsl(232, 77%, 65%)",
        "usage": ["buttons", "links", "primary-actions"]
      }
    ],
    "semantic": {
      "success": [
        {
          "name": "success-1",
          "value": "#10b981",
          "usage": ["success"]
        }
      ]
    }
  }
}
```

### Example 4: Typography System

**Input**: Page with various text elements

**Output**:
```json
{
  "typography": {
    "fontFamilies": [
      {
        "name": "primary",
        "value": "Inter, sans-serif"
      }
    ],
    "fontSizes": [
      "12px", "14px", "16px", "20px", "24px", "32px", "48px"
    ],
    "fontWeights": [
      "400", "500", "600", "700"
    ]
  }
}
```

## Component Library Generation

### Example 5: Button Variants

**Input**: Screenshot with multiple button styles

**Detected Components**:
- Button/Primary
- Button/Secondary
- Button/Outline
- Button/Ghost

**Generated Structure**:
```json
{
  "name": "Button/Primary",
  "variants": [
    {
      "name": "Button/Primary/Default",
      "properties": { "state": "default", "size": "md" }
    },
    {
      "name": "Button/Primary/Hover",
      "properties": { "state": "hover", "size": "md" }
    }
  ],
  "autoLayout": {
    "enabled": true,
    "direction": "horizontal",
    "padding": { "top": 8, "right": 16, "bottom": 8, "left": 16 }
  }
}
```

### Example 6: Form Components

**Input**: Form with inputs, checkboxes, dropdowns

**Detected Components**:
- Input/TextField
- Input/TextArea
- Checkbox/Default
- Dropdown/Select
- Button/Submit

## Export Workflows

### Example 7: Export to React/Tailwind

**Workflow**:
1. Upload screenshots
2. Export as JavaScript
3. Use in React components

**Output (JavaScript)**:
```javascript
export const designTokens = {
  colors: {
    primary: {
      500: '#667eea',
      600: '#5a67d8',
      700: '#4c51bf'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px'
  }
};

// Usage in React
const Button = () => (
  <button style={{
    backgroundColor: designTokens.colors.primary[500],
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`
  }}>
    Click Me
  </button>
);
```

### Example 8: Export to SCSS

**Workflow**:
1. Analyze design
2. Export as SCSS
3. Import in your project

**Output (SCSS)**:
```scss
// Design Tokens
$primary-1: #667eea;
$primary-2: #5a67d8;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;

// Usage
.button {
  background: $primary-1;
  padding: $spacing-sm $spacing-md;

  &:hover {
    background: $primary-2;
  }
}
```

### Example 9: CSS Custom Properties

**Workflow**:
1. Generate tokens
2. Export as CSS
3. Use with vanilla CSS/HTML

**Output (CSS)**:
```css
:root {
  --primary-1: #667eea;
  --spacing-md: 16px;
  --radius-md: 8px;
}

.button {
  background: var(--primary-1);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

## Integration Examples

### Example 10: Integrate with Design System Repository

**Setup**:
```bash
# 1. Generate design tokens
npm run dev

# 2. Export as JSON
# Download from app UI

# 3. Add to your design system repo
cp design-tokens.json ../my-design-system/tokens/

# 4. Use in build process
npm run build-tokens
```

**tokens/design-tokens.json**:
```json
{
  "colors": { ... },
  "typography": { ... },
  "spacing": { ... }
}
```

### Example 11: Figma Plugin Integration

**Workflow**:
1. Analyze screenshots
2. Download Figma structure JSON
3. Use with Figma API to create actual components

**Example Code**:
```javascript
const figmaStructure = require('./figma-style-guide.json');

// Use Figma API to create components
async function createFigmaComponents() {
  const { components } = figmaStructure;

  for (const component of components) {
    await figma.createComponent({
      name: component.name,
      properties: component.componentPropertyDefinitions
    });
  }
}
```

### Example 12: Storybook Integration

**Workflow**:
1. Export design tokens as JavaScript
2. Import in Storybook
3. Create stories using tokens

**Example**:
```javascript
// design-tokens.js
export const tokens = { ... };

// Button.stories.js
import { tokens } from '../design-tokens';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => (
  <Button
    style={{
      backgroundColor: tokens.colors.primary[500],
      padding: tokens.spacing.md
    }}
  >
    Primary Button
  </Button>
);
```

## Advanced Use Cases

### Example 13: A/B Testing Different Designs

**Scenario**: Compare design systems from two different versions

**Workflow**:
1. Upload Version A screenshots → Export as `tokens-v1.json`
2. Upload Version B screenshots → Export as `tokens-v2.json`
3. Compare and analyze differences

### Example 14: Competitor Analysis

**Scenario**: Analyze competitor's design system

**Workflow**:
1. Take screenshots of competitor's app
2. Upload and analyze
3. Compare with your design system
4. Identify gaps or opportunities

### Example 15: Design Audit

**Scenario**: Audit an existing app for design inconsistencies

**Steps**:
1. Screenshot all major pages
2. Upload and analyze
3. Review color variations
4. Identify inconsistent spacing
5. Document typography issues

**Insights**:
- "You have 47 different shades of gray"
- "Button padding varies between 8px and 16px"
- "Font sizes range from 11px to 73px"

### Example 16: Migrate from Old Design System

**Scenario**: Updating from Bootstrap to custom design system

**Workflow**:
1. Screenshot current Bootstrap-based UI
2. Analyze and extract actual used tokens
3. Create mapping to new design system
4. Export and integrate

## Tips for Better Results

### 1. Screenshot Quality

**Good**:
- High resolution (1920x1080 or higher)
- Clear, uncompressed
- Full components visible

**Bad**:
- Low resolution
- Heavily compressed
- Cropped or partial views

### 2. Multiple States

Upload variations:
```
button-default.png
button-hover.png
button-active.png
button-disabled.png
```

### 3. Component Coverage

Include diverse elements:
- ✅ Navigation bars
- ✅ Forms (inputs, selects, checkboxes)
- ✅ Buttons (all variants)
- ✅ Cards
- ✅ Modals/Dialogs
- ✅ Typography examples
- ✅ Color swatches

## Real-World Projects

### Example 17: E-commerce Site

**Components Detected**:
- Product/Card
- Button/AddToCart
- Input/Search
- Navigation/Header
- Modal/ProductDetail

### Example 18: SaaS Dashboard

**Components Detected**:
- Card/StatCard
- Navigation/Sidebar
- Button/Primary
- Input/TextField
- Dropdown/Filter

### Example 19: Landing Page

**Tokens Extracted**:
- Hero section typography
- CTA button styles
- Section spacing
- Brand colors
- Feature card components

---

Need more examples? [Open an issue](https://github.com/yourusername/AI-Ready-StyleGuide-Generator/issues) with your use case!
