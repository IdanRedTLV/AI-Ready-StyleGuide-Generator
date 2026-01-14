const axios = require('axios');

class FigmaService {
  constructor() {
    this.apiKey = process.env.FIGMA_ACCESS_TOKEN;
    this.baseURL = 'https://api.figma.com/v1';
  }

  generateStyleGuide({ designTokens, componentLibrary, projectName }) {
    // Generate machine-readable Figma style guide structure
    const styleGuide = {
      projectName,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      aiGenerated: true,

      // Design Tokens
      tokens: {
        colors: this.formatColorTokens(designTokens.colors),
        typography: this.formatTypographyTokens(designTokens.typography),
        spacing: this.formatSpacingTokens(designTokens.spacing),
        borderRadius: designTokens.borderRadius,
        shadows: designTokens.shadows,
        breakpoints: designTokens.breakpoints
      },

      // Component Library
      components: this.formatComponentLibrary(componentLibrary),

      // Figma-specific structure
      figma: {
        styles: this.generateFigmaStyles(designTokens),
        components: this.generateFigmaComponents(componentLibrary),
        pages: this.generateFigmaPages(designTokens, componentLibrary)
      },

      // Export formats
      exports: {
        css: this.generateCSS(designTokens),
        scss: this.generateSCSS(designTokens),
        json: this.generateJSON(designTokens),
        javascript: this.generateJavaScript(designTokens)
      }
    };

    return styleGuide;
  }

  formatColorTokens(colors) {
    const formatted = [];

    // Primary colors
    if (colors.primary) {
      colors.primary.forEach((color, index) => {
        formatted.push({
          name: `Color/Primary/${index + 1}`,
          value: color.value,
          hsl: color.hsl,
          semanticName: color.name,
          usage: ['buttons', 'links', 'primary-actions']
        });
      });
    }

    // Secondary colors
    if (colors.secondary) {
      colors.secondary.forEach((color, index) => {
        formatted.push({
          name: `Color/Secondary/${index + 1}`,
          value: color.value,
          hsl: color.hsl,
          semanticName: color.name,
          usage: ['secondary-actions', 'accents']
        });
      });
    }

    // Neutral colors
    if (colors.neutral) {
      colors.neutral.forEach((color, index) => {
        formatted.push({
          name: `Color/Neutral/${index + 1}`,
          value: color.value,
          hsl: color.hsl,
          semanticName: color.name,
          usage: ['backgrounds', 'borders', 'text']
        });
      });
    }

    // Semantic colors
    if (colors.semantic) {
      ['success', 'warning', 'error', 'info'].forEach(type => {
        if (colors.semantic[type]) {
          colors.semantic[type].forEach((color, index) => {
            formatted.push({
              name: `Color/Semantic/${type.charAt(0).toUpperCase() + type.slice(1)}/${index + 1}`,
              value: color.value,
              hsl: color.hsl,
              semanticName: color.name,
              usage: [type]
            });
          });
        }
      });
    }

    return formatted;
  }

  formatTypographyTokens(typography) {
    const formatted = {
      fontFamilies: typography.fontFamilies || [],
      fontSizes: (typography.fontSizes || []).map((size, index) => ({
        name: `Typography/Size/${index + 1}`,
        value: size,
        semanticName: this.getFontSizeSemanticName(size)
      })),
      fontWeights: (typography.fontWeights || []).map(weight => ({
        name: `Typography/Weight/${this.getWeightName(weight)}`,
        value: weight
      })),
      lineHeights: (typography.lineHeights || []).map((height, index) => ({
        name: `Typography/LineHeight/${index + 1}`,
        value: height
      }))
    };

    return formatted;
  }

  formatSpacingTokens(spacing) {
    return {
      scale: spacing.scale || [],
      patterns: spacing.patterns || {},
      semanticSpacing: {
        componentGap: spacing.patterns?.md || '16px',
        sectionGap: spacing.patterns?.xl || '32px',
        containerPadding: spacing.patterns?.lg || '24px'
      }
    };
  }

  formatComponentLibrary(componentLibrary) {
    if (!componentLibrary || !componentLibrary.components) {
      return [];
    }

    return componentLibrary.components.map(component => ({
      name: component.name,
      type: component.type,
      variants: this.generateVariants(component),
      properties: component.properties || {},
      autoLayout: {
        enabled: true,
        direction: this.inferLayoutDirection(component.type),
        spacing: 8,
        padding: this.inferComponentPadding(component.type)
      },
      semanticName: component.name,
      description: `AI-detected ${component.type} component with ${component.occurrences} occurrence(s)`
    }));
  }

  generateVariants(component) {
    const variants = [];
    const states = ['default', 'hover', 'active', 'disabled', 'focus'];
    const sizes = ['sm', 'md', 'lg'];

    // Generate state variants
    states.forEach(state => {
      variants.push({
        name: `${component.name}/${state.charAt(0).toUpperCase() + state.slice(1)}`,
        properties: {
          state,
          size: 'md'
        }
      });
    });

    // Generate size variants
    sizes.forEach(size => {
      variants.push({
        name: `${component.name}/${size.toUpperCase()}`,
        properties: {
          state: 'default',
          size
        }
      });
    });

    return variants;
  }

  generateFigmaStyles(designTokens) {
    const styles = {
      colorStyles: [],
      textStyles: [],
      effectStyles: []
    };

    // Color styles
    const allColors = [
      ...(designTokens.colors.primary || []),
      ...(designTokens.colors.secondary || []),
      ...(designTokens.colors.neutral || [])
    ];

    allColors.forEach(color => {
      styles.colorStyles.push({
        name: color.name,
        styleType: 'FILL',
        fills: [{
          type: 'SOLID',
          color: this.hexToRGB(color.value)
        }]
      });
    });

    // Text styles
    if (designTokens.typography && designTokens.typography.fontSizes) {
      designTokens.typography.fontSizes.forEach((size, index) => {
        styles.textStyles.push({
          name: `Text/Body/${index + 1}`,
          fontSize: parseInt(size),
          fontFamily: 'Inter',
          fontWeight: 400,
          lineHeight: 1.5
        });
      });
    }

    // Effect styles (shadows)
    if (designTokens.shadows && designTokens.shadows.levels) {
      designTokens.shadows.levels.forEach(shadow => {
        if (shadow.value !== 'none') {
          styles.effectStyles.push({
            name: `Shadow/${shadow.name}`,
            effects: [{
              type: 'DROP_SHADOW',
              value: shadow.value
            }]
          });
        }
      });
    }

    return styles;
  }

  generateFigmaComponents(componentLibrary) {
    if (!componentLibrary || !componentLibrary.components) {
      return [];
    }

    return componentLibrary.components.map(component => ({
      name: component.name,
      description: `Auto-generated from UI analysis`,
      componentPropertyDefinitions: this.generatePropertyDefinitions(component),
      children: this.generateComponentChildren(component)
    }));
  }

  generatePropertyDefinitions(component) {
    return {
      state: {
        type: 'VARIANT',
        defaultValue: 'default',
        variantOptions: ['default', 'hover', 'active', 'disabled', 'focus']
      },
      size: {
        type: 'VARIANT',
        defaultValue: 'md',
        variantOptions: ['sm', 'md', 'lg']
      },
      label: {
        type: 'TEXT',
        defaultValue: component.type
      }
    };
  }

  generateComponentChildren(component) {
    const baseStructure = {
      Button: [
        { type: 'FRAME', name: 'Container', autoLayout: true },
        { type: 'TEXT', name: 'Label' }
      ],
      Input: [
        { type: 'FRAME', name: 'Container', autoLayout: true },
        { type: 'TEXT', name: 'Placeholder' }
      ],
      Card: [
        { type: 'FRAME', name: 'Container', autoLayout: true },
        { type: 'FRAME', name: 'Header' },
        { type: 'FRAME', name: 'Content' },
        { type: 'FRAME', name: 'Footer' }
      ]
    };

    return baseStructure[component.type] || [
      { type: 'FRAME', name: 'Container', autoLayout: true }
    ];
  }

  generateFigmaPages(designTokens, componentLibrary) {
    return [
      {
        name: '🎨 Design Tokens',
        sections: [
          { name: 'Colors', content: 'colorStyles' },
          { name: 'Typography', content: 'textStyles' },
          { name: 'Spacing', content: 'spacingTokens' },
          { name: 'Effects', content: 'effectStyles' }
        ]
      },
      {
        name: '🧩 Components',
        sections: [
          { name: 'Form Controls', content: 'formComponents' },
          { name: 'Navigation', content: 'navigationComponents' },
          { name: 'Data Display', content: 'dataComponents' },
          { name: 'Feedback', content: 'feedbackComponents' }
        ]
      },
      {
        name: '📖 Documentation',
        sections: [
          { name: 'Usage Guidelines', content: 'guidelines' },
          { name: 'Code Examples', content: 'codeExamples' }
        ]
      }
    ];
  }

  generateCSS(designTokens) {
    let css = '/* AI-Generated Design Tokens - CSS Variables */\n\n:root {\n';

    // Colors
    if (designTokens.colors) {
      css += '  /* Colors */\n';
      const allColors = [
        ...(designTokens.colors.primary || []),
        ...(designTokens.colors.secondary || []),
        ...(designTokens.colors.neutral || [])
      ];

      allColors.forEach(color => {
        css += `  --${color.name}: ${color.value};\n`;
      });
      css += '\n';
    }

    // Spacing
    if (designTokens.spacing && designTokens.spacing.patterns) {
      css += '  /* Spacing */\n';
      Object.entries(designTokens.spacing.patterns).forEach(([key, value]) => {
        css += `  --spacing-${key}: ${value};\n`;
      });
      css += '\n';
    }

    // Border Radius
    if (designTokens.borderRadius) {
      css += '  /* Border Radius */\n';
      designTokens.borderRadius.values.forEach(radius => {
        css += `  --radius-${radius.name}: ${radius.value};\n`;
      });
      css += '\n';
    }

    // Shadows
    if (designTokens.shadows) {
      css += '  /* Shadows */\n';
      designTokens.shadows.levels.forEach(shadow => {
        css += `  --shadow-${shadow.name}: ${shadow.value};\n`;
      });
    }

    css += '}\n';

    return css;
  }

  generateSCSS(designTokens) {
    let scss = '// AI-Generated Design Tokens - SCSS Variables\n\n';

    if (designTokens.colors) {
      scss += '// Colors\n';
      const allColors = [
        ...(designTokens.colors.primary || []),
        ...(designTokens.colors.secondary || []),
        ...(designTokens.colors.neutral || [])
      ];

      allColors.forEach(color => {
        scss += `$${color.name}: ${color.value};\n`;
      });
      scss += '\n';
    }

    return scss;
  }

  generateJSON(designTokens) {
    return JSON.stringify(designTokens, null, 2);
  }

  generateJavaScript(designTokens) {
    return `// AI-Generated Design Tokens - JavaScript/TypeScript\n\nexport const designTokens = ${JSON.stringify(designTokens, null, 2)};\n`;
  }

  exportTokens(designTokens, format) {
    switch (format) {
      case 'css':
        return this.generateCSS(designTokens);
      case 'scss':
        return this.generateSCSS(designTokens);
      case 'javascript':
      case 'js':
        return this.generateJavaScript(designTokens);
      case 'json':
      default:
        return this.generateJSON(designTokens);
    }
  }

  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }

  getFontSizeSemanticName(size) {
    const sizeValue = parseInt(size);
    if (sizeValue <= 12) return 'xs';
    if (sizeValue <= 14) return 'sm';
    if (sizeValue <= 16) return 'base';
    if (sizeValue <= 18) return 'lg';
    if (sizeValue <= 24) return 'xl';
    if (sizeValue <= 32) return '2xl';
    if (sizeValue <= 40) return '3xl';
    return '4xl';
  }

  getWeightName(weight) {
    const weights = {
      '100': 'thin',
      '200': 'extralight',
      '300': 'light',
      '400': 'normal',
      '500': 'medium',
      '600': 'semibold',
      '700': 'bold',
      '800': 'extrabold',
      '900': 'black'
    };
    return weights[weight] || weight;
  }

  inferLayoutDirection(componentType) {
    const horizontal = ['Button', 'Navigation', 'Radio', 'Checkbox'];
    return horizontal.includes(componentType) ? 'horizontal' : 'vertical';
  }

  inferComponentPadding(componentType) {
    const paddingMap = {
      'Button': { top: 8, right: 16, bottom: 8, left: 16 },
      'Input': { top: 8, right: 12, bottom: 8, left: 12 },
      'Card': { top: 16, right: 16, bottom: 16, left: 16 },
      'Modal': { top: 24, right: 24, bottom: 24, left: 24 }
    };
    return paddingMap[componentType] || { top: 12, right: 12, bottom: 12, left: 12 };
  }
}

module.exports = new FigmaService();
