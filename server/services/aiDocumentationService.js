/**
 * AI Documentation Service
 * Generates AI-optimized design system documentation that teaches AI models
 * how to use the design system correctly when generating UI code.
 */

class AIDocumentationService {
  /**
   * Generate complete AI-ready documentation
   * @param {Object} designTokens - Raw design tokens from analysis
   * @param {Object} componentLibrary - Component library data
   * @param {Object} options - Additional options (projectName, sourceType, etc.)
   * @returns {Object} Complete AI-ready documentation
   */
  generateAIReadyDocumentation({ designTokens, componentLibrary, options = {} }) {
    const {
      projectName = 'Design System',
      sourceType = 'figma',
      figmaUrl = null
    } = options;

    return {
      aiInstructions: this.generateAIInstructions(),
      metadata: this.generateMetadata(projectName, sourceType, figmaUrl),
      tokens: this.convertToW3CFormat(designTokens),
      components: this.enhanceComponentsWithUsageRules(componentLibrary),
      patterns: this.generateCommonPatterns(),
      rules: this.generateGlobalRules(),
      accessibility: this.generateAccessibilityGuidelines(),
      responsive: this.generateResponsiveRules()
    };
  }

  /**
   * Generate AI instructions - what AI should know before generating code
   */
  generateAIInstructions() {
    return {
      purpose: "This is a complete design system specification extracted from Figma. When generating UI code, you MUST reference these tokens and follow these patterns.",
      criticalRules: [
        "ALWAYS use token references (e.g., var(--color-primary)), NEVER hardcode values",
        "Follow component anatomy exactly as specified in the components section",
        "Respect composition rules (canContain/cannotContain)",
        "Implement all accessibility requirements for each component",
        "Use provided code examples as templates for implementation",
        "Follow responsive behavior rules for each breakpoint",
        "Reference semantic tokens (action, surface) over base tokens when available"
      ],
      howToUse: {
        tokens: "All design tokens are in W3C format with $value, $type, and $description. Reference them in your code using CSS variables or your framework's token system.",
        components: "Each component includes anatomy (structure), variants (states/sizes), usage rules (do/don't), and code examples. Follow these patterns exactly.",
        patterns: "Common composition patterns show how components work together. Use these for forms, cards, modals, etc.",
        accessibility: "Every component has accessibility requirements. These are not optional - implement all keyboard navigation, ARIA attributes, and contrast requirements."
      }
    };
  }

  /**
   * Generate metadata
   */
  generateMetadata(projectName, sourceType, figmaUrl) {
    return {
      name: projectName,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      source: {
        type: sourceType,
        figmaUrl: figmaUrl
      },
      format: 'W3C Design Tokens + AI-Ready Component Documentation',
      compatibleWith: ['Claude', 'GPT-4', 'Gemini', 'Figma MCP']
    };
  }

  /**
   * Convert design tokens to W3C Design Tokens format
   */
  convertToW3CFormat(designTokens) {
    const w3cTokens = {};

    // Colors
    if (designTokens.colors) {
      w3cTokens.colors = {
        base: {},
        semantic: {}
      };

      // Primary colors
      if (designTokens.colors.primary) {
        designTokens.colors.primary.forEach((color, i) => {
          const tokenName = color.name || `primary-${i + 1}`;
          w3cTokens.colors.base[tokenName] = {
            $value: color.value,
            $type: 'color',
            $description: `Primary brand color ${i + 1}. Use for main actions, primary buttons, and brand elements.`
          };
        });

        // Create semantic alias for primary action
        if (designTokens.colors.primary[0]) {
          w3cTokens.colors.semantic.action = {
            $value: `{colors.base.${designTokens.colors.primary[0].name || 'primary-1'}}`,
            $type: 'color',
            $description: 'Use for all actionable elements: buttons, links, active states. Always use this instead of directly referencing primary colors.'
          };
        }
      }

      // Neutral colors
      if (designTokens.colors.neutral) {
        designTokens.colors.neutral.forEach((color, i) => {
          const tokenName = color.name || `neutral-${i + 1}`;
          w3cTokens.colors.base[tokenName] = {
            $value: color.value,
            $type: 'color',
            $description: `Neutral color ${i + 1}. Use for backgrounds, borders, and subtle UI elements.`
          };
        });

        // Create semantic aliases
        if (designTokens.colors.neutral.length > 0) {
          w3cTokens.colors.semantic.surface = {
            $value: `{colors.base.${designTokens.colors.neutral[0]?.name || 'neutral-1'}}`,
            $type: 'color',
            $description: 'Background color for cards, panels, and elevated surfaces'
          };
        }

        if (designTokens.colors.neutral.length > 1) {
          w3cTokens.colors.semantic.border = {
            $value: `{colors.base.${designTokens.colors.neutral[1]?.name || 'neutral-2'}}`,
            $type: 'color',
            $description: 'Border color for inputs, dividers, and separators'
          };
        }
      }
    }

    // Typography
    if (designTokens.typography) {
      w3cTokens.typography = {};

      // Font families
      if (designTokens.typography.fontFamilies) {
        designTokens.typography.fontFamilies.forEach((font) => {
          const tokenName = font.name || 'body';
          w3cTokens.typography[`font-family-${tokenName}`] = {
            $value: font.value,
            $type: 'fontFamily',
            $description: `${tokenName} font family. ${tokenName === 'primary' ? 'Use for headings and emphasis.' : tokenName === 'secondary' ? 'Use for body text and UI.' : 'Use for code and monospace content.'}`
          };
        });
      }

      // Font sizes
      if (designTokens.typography.fontSizes) {
        designTokens.typography.fontSizes.forEach((size, i) => {
          const sizeValue = typeof size === 'string' ? size : `${size}px`;
          const semanticName = this.getFontSizeSemanticName(parseInt(sizeValue));
          w3cTokens.typography[`font-size-${semanticName}`] = {
            $value: sizeValue,
            $type: 'dimension',
            $description: `Font size ${semanticName}. ${this.getFontSizeUsage(semanticName)}`
          };
        });
      }

      // Font weights
      if (designTokens.typography.fontWeights) {
        designTokens.typography.fontWeights.forEach((weight) => {
          const weightName = this.getWeightName(weight);
          w3cTokens.typography[`font-weight-${weightName}`] = {
            $value: String(weight),
            $type: 'fontWeight',
            $description: `Font weight ${weightName}. ${this.getFontWeightUsage(weightName)}`
          };
        });
      }

      // Line heights
      if (designTokens.typography.lineHeights) {
        designTokens.typography.lineHeights.forEach((height, i) => {
          const heightValue = typeof height === 'string' ? height : `${height}px`;
          w3cTokens.typography[`line-height-${i + 1}`] = {
            $value: heightValue,
            $type: 'dimension',
            $description: `Line height ${i + 1}. Use with corresponding font size.`
          };
        });
      }
    }

    // Spacing
    if (designTokens.spacing && designTokens.spacing.scale) {
      w3cTokens.spacing = {};

      designTokens.spacing.scale.forEach((space) => {
        const tokenName = space.name || `space-${space.value}`;
        w3cTokens.spacing[tokenName] = {
          $value: space.value,
          $type: 'dimension',
          $description: `Spacing value ${space.value}. ${this.getSpacingUsage(space.value)}`
        };
      });
    }

    // Border radius
    if (designTokens.borderRadius && designTokens.borderRadius.values) {
      w3cTokens.borderRadius = {};

      designTokens.borderRadius.values.forEach((radius) => {
        const tokenName = radius.name || `radius-${radius.value}`;
        w3cTokens.borderRadius[tokenName] = {
          $value: radius.value,
          $type: 'dimension',
          $description: `Border radius ${radius.value}. ${this.getBorderRadiusUsage(radius.value)}`
        };
      });
    }

    return w3cTokens;
  }

  /**
   * Enhance components with usage rules, patterns, and AI guidance
   */
  enhanceComponentsWithUsageRules(componentLibrary) {
    if (!componentLibrary || !componentLibrary.components) {
      return [];
    }

    return componentLibrary.components.map(component => ({
      name: component.name,
      type: component.type,
      description: component.description || `${component.name} component`,

      anatomy: this.generateComponentAnatomy(component),
      variants: component.variants || [],

      tokens: this.getComponentTokenReferences(component),

      compositionRules: this.generateCompositionRules(component),

      usage: this.generateUsageGuidance(component),

      accessibility: this.generateComponentAccessibility(component),

      responsive: this.generateComponentResponsive(component),

      codeExample: this.generateCodeExample(component)
    }));
  }

  /**
   * Generate component anatomy
   */
  generateComponentAnatomy(component) {
    // Default anatomies for common components
    const anatomyTemplates = {
      Button: [
        { part: 'container', type: 'Frame', required: true, description: 'Main button container with auto-layout' },
        { part: 'label', type: 'Text', required: true, description: 'Button text label' },
        { part: 'icon', type: 'Icon', required: false, description: 'Optional icon before or after label' }
      ],
      Input: [
        { part: 'container', type: 'Frame', required: true, description: 'Input field container' },
        { part: 'input', type: 'Input', required: true, description: 'Text input element' },
        { part: 'label', type: 'Text', required: false, description: 'Field label' },
        { part: 'helper', type: 'Text', required: false, description: 'Helper or error text' }
      ],
      Card: [
        { part: 'container', type: 'Frame', required: true, description: 'Card container with elevation' },
        { part: 'header', type: 'Frame', required: false, description: 'Optional card header' },
        { part: 'body', type: 'Frame', required: true, description: 'Main card content area' },
        { part: 'footer', type: 'Frame', required: false, description: 'Optional card footer' }
      ]
    };

    return anatomyTemplates[component.type] || [
      { part: 'container', type: 'Frame', required: true, description: 'Main component container' }
    ];
  }

  /**
   * Generate component token references
   */
  getComponentTokenReferences(component) {
    const tokenTemplates = {
      Button: {
        background: '{colors.semantic.action}',
        text: '{colors.base.white}',
        borderRadius: '{borderRadius.radius-1}',
        padding: '{spacing.spacing-2}',
        fontSize: '{typography.font-size-base}',
        fontWeight: '{typography.font-weight-medium}'
      },
      Input: {
        background: '{colors.semantic.surface}',
        border: '{colors.semantic.border}',
        text: '{colors.base.text}',
        borderRadius: '{borderRadius.radius-1}',
        padding: '{spacing.spacing-2}'
      },
      Card: {
        background: '{colors.semantic.surface}',
        border: '{colors.semantic.border}',
        borderRadius: '{borderRadius.radius-2}',
        padding: '{spacing.spacing-3}',
        shadow: '{shadows.elevation-1}'
      }
    };

    return tokenTemplates[component.type] || {};
  }

  /**
   * Generate composition rules
   */
  generateCompositionRules(component) {
    const rules = {
      Button: {
        canContain: ['Text (required)', 'Icon (optional)'],
        cannotContain: ['Button', 'Input', 'Select'],
        maxNesting: 1,
        spacing: '8px between icon and text'
      },
      Input: {
        canContain: ['Label (optional)', 'Input (required)', 'HelperText (optional)', 'ErrorMessage (optional)'],
        cannotContain: ['Button', 'Card'],
        maxNesting: 2,
        spacing: '4px between elements'
      },
      Card: {
        canContain: ['Any components except Modal'],
        cannotContain: ['Card (nested cards not recommended)'],
        maxNesting: 999,
        spacing: '16px between sections'
      }
    };

    return rules[component.type] || {
      canContain: ['Any'],
      cannotContain: [],
      maxNesting: 999
    };
  }

  /**
   * Generate usage guidance with do/don't patterns
   */
  generateUsageGuidance(component) {
    const usageTemplates = {
      Button: {
        do: [
          'Use primary variant for the main action on a screen or section',
          'Always reference design tokens, never hardcode colors',
          'Include descriptive text or aria-label',
          'Ensure minimum 44px height on mobile (touch target)'
        ],
        dont: [
          "Don't use multiple primary buttons in the same section",
          "Don't make buttons smaller than 40px height on desktop",
          "Don't use red/destructive colors for primary actions",
          "Never hardcode #667eea - use var(--color-action)"
        ],
        commonMistakes: [
          {
            mistake: 'Hardcoding colors',
            wrong: 'background: #667eea',
            correct: 'background: var(--color-action)',
            why: 'Tokens enable theming and consistent updates'
          },
          {
            mistake: 'Ignoring touch targets on mobile',
            wrong: 'height: 32px on mobile',
            correct: 'height: 44px minimum on mobile',
            why: 'Accessibility and usability on touch devices'
          }
        ]
      },
      Input: {
        do: [
          'Always include a label (visible or aria-label)',
          'Use helper text to provide guidance',
          'Show error states with clear messages',
          'Ensure proper keyboard navigation (Tab, Enter)'
        ],
        dont: [
          "Don't use placeholder as the only label",
          "Don't make input fields too narrow (min 200px)",
          "Don't forget focus indicators",
          "Never disable autocomplete without good reason"
        ],
        commonMistakes: [
          {
            mistake: 'Placeholder as label',
            wrong: '<input placeholder="Email" />',
            correct: '<label>Email</label><input />',
            why: 'Placeholders disappear on focus, causing usability issues'
          }
        ]
      }
    };

    return usageTemplates[component.type] || {
      do: ['Follow design system guidelines', 'Use design tokens'],
      dont: ['Hardcode values', 'Ignore accessibility'],
      commonMistakes: []
    };
  }

  /**
   * Generate component-specific accessibility requirements
   */
  generateComponentAccessibility(component) {
    const a11yTemplates = {
      Button: {
        role: 'button',
        requiredAttributes: ['aria-label OR visible text content'],
        optionalAttributes: ['aria-pressed (for toggle buttons)', 'aria-disabled (when disabled)'],
        keyboard: {
          Enter: 'Activate button',
          Space: 'Activate button',
          Tab: 'Navigate to next focusable element'
        },
        minContrast: '4.5:1 for text, 3:1 for UI elements',
        focusIndicator: {
          required: true,
          style: '2px solid var(--color-focus)',
          offset: '2px'
        }
      },
      Input: {
        role: 'textbox',
        requiredAttributes: ['aria-label OR associated <label>', 'aria-invalid when error'],
        optionalAttributes: ['aria-describedby (for helper text)', 'aria-required'],
        keyboard: {
          Tab: 'Navigate between fields',
          Enter: 'Submit form (if in form)',
          Escape: 'Clear field (optional)'
        },
        minContrast: '4.5:1 for text and borders',
        focusIndicator: {
          required: true,
          style: '2px solid var(--color-focus)',
          offset: '0px'
        }
      }
    };

    return a11yTemplates[component.type] || {
      role: 'generic',
      requiredAttributes: [],
      keyboard: {},
      minContrast: '4.5:1',
      focusIndicator: { required: true }
    };
  }

  /**
   * Generate responsive behavior rules
   */
  generateComponentResponsive(component) {
    const responsiveTemplates = {
      Button: {
        mobile: {
          breakpoint: '< 768px',
          rules: {
            width: '100% (full-width for primary actions)',
            minHeight: '44px',
            fontSize: '16px (prevents iOS zoom)',
            padding: 'var(--spacing-spacing-2)'
          }
        },
        tablet: {
          breakpoint: '768px - 1024px',
          rules: {
            width: 'auto (fit content)',
            minHeight: '44px',
            fontSize: '16px'
          }
        },
        desktop: {
          breakpoint: '> 1024px',
          rules: {
            width: 'auto (fit content)',
            minWidth: '120px',
            maxWidth: '300px',
            minHeight: '40px'
          }
        }
      }
    };

    return responsiveTemplates[component.type] || {};
  }

  /**
   * Generate code example
   */
  generateCodeExample(component) {
    const examples = {
      Button: `<!-- Primary Button Example -->
<button
  class="btn btn-primary"
  style="
    background: var(--color-action);
    color: white;
    padding: var(--spacing-spacing-2) var(--spacing-spacing-3);
    border-radius: var(--radius-radius-1);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    min-height: 44px;
  "
>
  Click me
</button>`,
      Input: `<!-- Input Field Example -->
<div class="form-field">
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    style="
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: var(--spacing-spacing-2);
      border-radius: var(--radius-radius-1);
      font-size: var(--font-size-base);
    "
  />
  <span class="helper-text">We'll never share your email</span>
</div>`,
      Card: `<!-- Card Example -->
<div class="card" style="
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-radius-2);
  padding: var(--spacing-spacing-3);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>`
    };

    return examples[component.type] || `<!-- ${component.name} Example -->\n<div class="${component.name.toLowerCase()}">\n  Content here\n</div>`;
  }

  /**
   * Generate common composition patterns
   */
  generateCommonPatterns() {
    return {
      FormField: {
        description: 'Standard form input pattern with label, input, and helper/error text',
        structure: [
          { component: 'Label', required: true, props: { htmlFor: '{input.id}' } },
          { component: 'Input', required: true, props: { id: 'unique-id' } },
          { component: 'HelperText', required: false, conditional: 'when input needs description' },
          { component: 'ErrorMessage', required: false, conditional: 'when input has validation error' }
        ],
        spacing: {
          'Label->Input': 'var(--spacing-spacing-1)',
          'Input->Helper': 'var(--spacing-spacing-1)',
          'Input->Error': 'var(--spacing-spacing-1)'
        },
        codeExample: `<div class="form-field">
  <label for="username">Username</label>
  <input id="username" type="text" />
  <span class="helper-text">Choose a unique username</span>
</div>`
      },
      CardWithActions: {
        description: 'Card with header, content, and action buttons in footer',
        structure: [
          { component: 'Card', required: true },
          { component: 'CardHeader', required: false },
          { component: 'CardBody', required: true },
          { component: 'CardFooter', required: false, contains: ['Button (primary)', 'Button (secondary)'] }
        ],
        spacing: {
          'sections': 'var(--spacing-spacing-3)'
        },
        codeExample: `<div class="card">
  <div class="card-header"><h3>Confirm Action</h3></div>
  <div class="card-body"><p>Are you sure?</p></div>
  <div class="card-footer">
    <button class="btn-secondary">Cancel</button>
    <button class="btn-primary">Confirm</button>
  </div>
</div>`
      }
    };
  }

  /**
   * Generate global design system rules
   */
  generateGlobalRules() {
    return {
      tokenUsage: {
        rule: 'ALWAYS use design tokens, NEVER hardcode values',
        enforcement: 'critical',
        examples: {
          correct: 'color: var(--color-action)',
          wrong: 'color: #667eea',
          why: 'Tokens enable theming, dark mode, and consistent updates across the entire design system'
        }
      },
      colorContrast: {
        rule: 'Minimum contrast ratios must be maintained',
        enforcement: 'critical',
        requirements: {
          text: '4.5:1 (AA standard)',
          largeText: '3:1 (AA standard for text 18px+ or bold 14px+)',
          uiElements: '3:1 (buttons, form inputs, focus indicators)'
        }
      },
      touchTargets: {
        rule: 'Minimum touch target sizes for interactive elements',
        enforcement: 'critical',
        requirements: {
          mobile: '44x44px minimum',
          desktop: '40x40px minimum',
          spacing: 'Minimum 8px spacing between adjacent touch targets'
        }
      },
      focusIndicators: {
        rule: 'All interactive elements must have visible focus indicators',
        enforcement: 'critical',
        style: '2px solid outline with var(--color-focus), 2px offset',
        exception: 'Never use outline: none without providing alternative focus style'
      },
      semanticTokens: {
        rule: 'Prefer semantic tokens over base tokens',
        enforcement: 'recommended',
        examples: {
          correct: 'var(--color-action) for buttons',
          lessCorrect: 'var(--color-primary)',
          wrong: 'var(--color-blue-500)',
          why: 'Semantic tokens adapt to context (light/dark mode, themes) while base tokens are fixed'
        }
      }
    };
  }

  /**
   * Generate accessibility guidelines
   */
  generateAccessibilityGuidelines() {
    return {
      keyboardNavigation: {
        description: 'All interactive elements must be keyboard accessible',
        requirements: [
          'Tab/Shift+Tab: Navigate between focusable elements',
          'Enter/Space: Activate buttons and links',
          'Escape: Close modals and dropdowns',
          'Arrow keys: Navigate within menus and lists',
          'Focus must be visible (see focusIndicators rule)'
        ]
      },
      ariaLabels: {
        description: 'Proper ARIA attributes for screen readers',
        requirements: [
          'All interactive elements need accessible names (aria-label or visible text)',
          'Use aria-describedby for helper text and errors',
          'Use aria-invalid="true" for form fields with errors',
          'Use aria-disabled="true" for disabled interactive elements',
          'Use role attribute only when HTML5 semantic elements are not available'
        ]
      },
      colorContrast: {
        description: 'Sufficient color contrast for readability',
        requirements: [
          'Text: 4.5:1 minimum (WCAG AA)',
          'Large text (18px+ or bold 14px+): 3:1 minimum',
          'UI components and graphical objects: 3:1 minimum',
          'Never rely on color alone to convey information'
        ]
      },
      focusManagement: {
        description: 'Proper focus handling for dynamic content',
        requirements: [
          'When opening modal/dialog: Move focus to first focusable element',
          'When closing modal/dialog: Return focus to trigger element',
          'Trap focus within modals (Tab cycles within modal)',
          'Skip links for keyboard users to bypass repeated content'
        ]
      }
    };
  }

  /**
   * Generate responsive behavior rules
   */
  generateResponsiveRules() {
    return {
      breakpoints: {
        mobile: '< 768px',
        tablet: '768px - 1024px',
        desktop: '> 1024px'
      },
      globalRules: {
        mobile: {
          description: 'Mobile-first approach for screens < 768px',
          rules: [
            'Full-width buttons for primary actions',
            'Minimum 44px touch targets',
            'Stack layouts vertically',
            '16px font size minimum (prevents iOS zoom)',
            'Reduce spacing scale by 25-50%',
            'Hide non-essential content'
          ]
        },
        tablet: {
          description: 'Tablet experience for screens 768px - 1024px',
          rules: [
            'Hybrid layouts (some stacking, some side-by-side)',
            'Touch-friendly 44px targets still recommended',
            'Consider horizontal space availability',
            'Show more content than mobile'
          ]
        },
        desktop: {
          description: 'Full desktop experience for screens > 1024px',
          rules: [
            'Multi-column layouts',
            'Smaller 40px minimum targets (mouse precision)',
            'Hover states for interactive elements',
            'Full navigation and content visible',
            'Larger spacing scale'
          ]
        }
      }
    };
  }

  // Helper methods
  getFontSizeSemanticName(size) {
    if (size <= 12) return 'xs';
    if (size <= 14) return 'sm';
    if (size <= 16) return 'base';
    if (size <= 18) return 'lg';
    if (size <= 24) return 'xl';
    if (size <= 32) return '2xl';
    return '3xl';
  }

  getFontSizeUsage(semanticName) {
    const usage = {
      'xs': 'Use for captions, helper text, or labels',
      'sm': 'Use for small body text, table data',
      'base': 'Use for body text, form inputs, and UI',
      'lg': 'Use for emphasized text, large buttons',
      'xl': 'Use for section headings (h3, h4)',
      '2xl': 'Use for page titles (h2)',
      '3xl': 'Use for hero titles (h1)'
    };
    return usage[semanticName] || 'General purpose text';
  }

  getWeightName(weight) {
    const weights = {
      100: 'thin', 200: 'extralight', 300: 'light',
      400: 'normal', 500: 'medium', 600: 'semibold',
      700: 'bold', 800: 'extrabold', 900: 'black'
    };
    return weights[weight] || weight;
  }

  getFontWeightUsage(weightName) {
    const usage = {
      'normal': 'Use for body text and general UI',
      'medium': 'Use for buttons, tabs, and emphasized text',
      'semibold': 'Use for headings and strong emphasis',
      'bold': 'Use for titles and primary headings'
    };
    return usage[weightName] || 'General purpose weight';
  }

  getSpacingUsage(value) {
    const size = parseInt(value);
    if (size <= 4) return 'Use for tight spacing between related elements';
    if (size <= 8) return 'Use for spacing within components';
    if (size <= 16) return 'Use for spacing between components';
    if (size <= 24) return 'Use for section spacing';
    return 'Use for large section gaps or page margins';
  }

  getBorderRadiusUsage(value) {
    const size = parseInt(value);
    if (size <= 4) return 'Use for subtle rounding on small elements';
    if (size <= 8) return 'Use for buttons, inputs, and cards';
    if (size <= 12) return 'Use for larger cards and panels';
    return 'Use for prominent rounded elements';
  }
}

module.exports = new AIDocumentationService();
