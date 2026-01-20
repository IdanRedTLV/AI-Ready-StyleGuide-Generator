const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

class AnalysisService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeScreenshot(imagePath) {
    // Read image and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(imagePath);

    const analysisPrompt = `Analyze this UI screenshot and extract design system information in a machine-readable format.

Identify and categorize:
1. **UI Components**: buttons, inputs, cards, navigation, modals, dropdowns, etc.
2. **Component States**: default, hover, active, disabled, focus, error, success
3. **Component Sizes**: small, medium, large, or specific dimensions
4. **Colors**: primary, secondary, accent, background, text, borders, etc. (provide hex values)
5. **Typography**: font families, sizes, weights, line heights
6. **Spacing**: margins, padding, gaps (in pixels or rem)
7. **Border Radius**: for rounded corners
8. **Shadows**: box shadows and elevation levels
9. **Layout Patterns**: grid systems, flexbox patterns

For each component, provide:
- Semantic name (e.g., "Button/Primary", "Input/TextField", "Card/Product")
- Variant information (state, size)
- Design token values used
- Position and dimensions
- Hierarchy and relationships

Return the analysis as a structured JSON object with clear categorization for AI consumption.`;

    // Try Anthropic first
    try {
      console.log('🤖 Trying Anthropic Claude...');
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: analysisPrompt
              }
            ]
          }
        ]
      });

      const analysisText = response.content[0].text;
      const analysis = this.parseAnalysisResponse(analysisText);
      console.log('✅ Anthropic analysis successful');
      return analysis;
    } catch (anthropicError) {
      console.warn('⚠️  Anthropic failed:', anthropicError.message);
      console.log('🔄 Falling back to OpenAI GPT-4 Vision...');

      // Fallback to OpenAI
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                },
                {
                  type: 'text',
                  text: analysisPrompt
                }
              ]
            }
          ]
        });

        const analysisText = response.choices[0].message.content;
        const analysis = this.parseAnalysisResponse(analysisText);
        console.log('✅ OpenAI analysis successful');
        return analysis;
      } catch (openaiError) {
        console.error('❌ OpenAI also failed:', openaiError.message);
        throw new Error(`Failed to analyze screenshot with both providers. Anthropic: ${anthropicError.message}, OpenAI: ${openaiError.message}`);
      }
    }
  }

  parseAnalysisResponse(text) {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse JSON, using structured extraction');
      }
    }

    // Fallback: structure the text response
    return {
      summary: text.substring(0, 500),
      components: this.extractComponents(text),
      colors: this.extractColors(text),
      typography: this.extractTypography(text),
      spacing: this.extractSpacing(text),
      rawAnalysis: text
    };
  }

  extractComponents(text) {
    const components = [];
    const componentPatterns = [
      /button|btn/gi,
      /input|textfield|text field/gi,
      /card/gi,
      /navigation|nav|navbar/gi,
      /modal|dialog/gi,
      /dropdown|select/gi,
      /checkbox/gi,
      /radio/gi,
      /switch|toggle/gi
    ];

    const lines = text.split('\n');
    for (const line of lines) {
      for (const pattern of componentPatterns) {
        if (pattern.test(line)) {
          components.push({
            type: this.normalizeComponentType(pattern.source),
            description: line.trim(),
            semanticName: this.generateSemanticName(line, pattern.source)
          });
        }
      }
    }

    return components;
  }

  extractColors(text) {
    const colors = [];
    const hexPattern = /#[0-9A-Fa-f]{6}/g;
    const matches = text.match(hexPattern);

    if (matches) {
      matches.forEach((hex, index) => {
        colors.push({
          name: `color-${index + 1}`,
          value: hex.toLowerCase(),
          usage: 'detected'
        });
      });
    }

    return colors;
  }

  extractTypography(text) {
    const typography = {
      fontFamilies: [],
      fontSizes: [],
      fontWeights: []
    };

    const fontSizePattern = /(\d+)(?:px|pt|rem)/gi;
    const matches = text.match(fontSizePattern);

    if (matches) {
      typography.fontSizes = [...new Set(matches)];
    }

    return typography;
  }

  extractSpacing(text) {
    const spacing = [];
    const spacingPattern = /(?:margin|padding|gap)[:\s]+(\d+(?:px|rem))/gi;
    let match;

    while ((match = spacingPattern.exec(text)) !== null) {
      spacing.push(match[1]);
    }

    return [...new Set(spacing)];
  }

  normalizeComponentType(pattern) {
    const typeMap = {
      'button|btn': 'Button',
      'input|textfield|text field': 'Input',
      'card': 'Card',
      'navigation|nav|navbar': 'Navigation',
      'modal|dialog': 'Modal',
      'dropdown|select': 'Dropdown',
      'checkbox': 'Checkbox',
      'radio': 'Radio',
      'switch|toggle': 'Switch'
    };

    for (const [key, value] of Object.entries(typeMap)) {
      if (new RegExp(key, 'i').test(pattern)) {
        return value;
      }
    }

    return 'Component';
  }

  generateSemanticName(description, type) {
    const normalized = this.normalizeComponentType(type);
    let variant = 'Default';

    if (/primary/i.test(description)) variant = 'Primary';
    else if (/secondary/i.test(description)) variant = 'Secondary';
    else if (/outline/i.test(description)) variant = 'Outline';
    else if (/ghost/i.test(description)) variant = 'Ghost';
    else if (/danger|error/i.test(description)) variant = 'Danger';
    else if (/success/i.test(description)) variant = 'Success';

    return `${normalized}/${variant}`;
  }

  async generateComponentLibrary(analysisResults) {
    const componentMap = new Map();

    // Consolidate components from all analyses
    for (const result of analysisResults) {
      const components = result.analysis.components || [];

      // Ensure components is an array
      if (!Array.isArray(components)) {
        console.warn('Components is not an array, skipping:', typeof components);
        continue;
      }

      for (const component of components) {
        const key = component.semanticName || component.type;

        if (!componentMap.has(key)) {
          componentMap.set(key, {
            name: key,
            type: component.type,
            variants: [],
            properties: {
              states: ['default'],
              sizes: ['medium']
            },
            designTokens: {},
            occurrences: 0
          });
        }

        const comp = componentMap.get(key);
        comp.occurrences++;
        comp.variants.push({
          source: result.filename,
          description: component.description
        });
      }
    }

    // Convert map to structured array
    const library = {
      components: Array.from(componentMap.values()),
      categories: this.categorizeComponents(componentMap),
      totalComponents: componentMap.size,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        aiGenerated: true
      }
    };

    return library;
  }

  categorizeComponents(componentMap) {
    const categories = {
      'Form Controls': [],
      'Navigation': [],
      'Data Display': [],
      'Feedback': [],
      'Layout': [],
      'Other': []
    };

    for (const [key, component] of componentMap) {
      const type = component.type.toLowerCase();

      if (['button', 'input', 'checkbox', 'radio', 'switch', 'dropdown'].includes(type)) {
        categories['Form Controls'].push(key);
      } else if (['navigation'].includes(type)) {
        categories['Navigation'].push(key);
      } else if (['card'].includes(type)) {
        categories['Data Display'].push(key);
      } else if (['modal'].includes(type)) {
        categories['Feedback'].push(key);
      } else {
        categories['Other'].push(key);
      }
    }

    return categories;
  }

  getMimeType(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }
}

module.exports = new AnalysisService();
