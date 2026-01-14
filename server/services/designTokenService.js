const sharp = require('sharp');
const fs = require('fs').promises;

class DesignTokenService {
  async consolidateTokens(analysisResults) {
    const tokens = {
      colors: {
        primary: [],
        secondary: [],
        neutral: [],
        semantic: {
          success: [],
          warning: [],
          error: [],
          info: []
        }
      },
      typography: {
        fontFamilies: [],
        fontSizes: [],
        fontWeights: [],
        lineHeights: []
      },
      spacing: {
        scale: [],
        patterns: {}
      },
      borderRadius: {
        values: []
      },
      shadows: {
        levels: []
      },
      breakpoints: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px'
      }
    };

    // Extract colors from all analyses
    const allColors = [];
    for (const result of analysisResults) {
      if (result.analysis.colors) {
        allColors.push(...result.analysis.colors);
      }

      // Extract colors from images
      try {
        const imageColors = await this.extractColorsFromImage(result.path);
        allColors.push(...imageColors);
      } catch (error) {
        console.warn(`Failed to extract colors from ${result.filename}:`, error.message);
      }
    }

    // Deduplicate and categorize colors
    tokens.colors = this.categorizeColors(allColors);

    // Consolidate typography
    const allTypography = analysisResults
      .map(r => r.analysis.typography)
      .filter(Boolean);

    if (allTypography.length > 0) {
      tokens.typography = this.consolidateTypography(allTypography);
    }

    // Consolidate spacing
    const allSpacing = analysisResults
      .map(r => r.analysis.spacing)
      .filter(Boolean)
      .flat();

    if (allSpacing.length > 0) {
      tokens.spacing = this.generateSpacingScale(allSpacing);
    }

    // Generate default design tokens
    tokens.borderRadius = this.generateBorderRadiusTokens();
    tokens.shadows = this.generateShadowTokens();

    return tokens;
  }

  async extractColorsFromImage(imagePath) {
    try {
      const image = sharp(imagePath);
      const { data, info } = await image
        .resize(100, 100, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colors = [];
      const colorMap = new Map();

      // Sample every 10th pixel to get representative colors
      for (let i = 0; i < data.length; i += info.channels * 10) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skip near-white and near-black colors
        if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
          continue;
        }

        const hex = this.rgbToHex(r, g, b);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      // Get top colors by frequency
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      for (const [hex, count] of sortedColors) {
        colors.push({
          value: hex,
          frequency: count,
          name: `color-${colors.length + 1}`
        });
      }

      return colors;
    } catch (error) {
      console.error('Color extraction error:', error);
      return [];
    }
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  categorizeColors(colors) {
    const categorized = {
      primary: [],
      secondary: [],
      neutral: [],
      semantic: {
        success: [],
        warning: [],
        error: [],
        info: []
      }
    };

    // Deduplicate colors
    const uniqueColors = [];
    const seen = new Set();

    for (const color of colors) {
      const value = color.value.toLowerCase();
      if (!seen.has(value)) {
        seen.add(value);
        uniqueColors.push(color);
      }
    }

    // Sort by frequency and categorize
    uniqueColors.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

    for (let i = 0; i < uniqueColors.length; i++) {
      const color = uniqueColors[i];
      const { h, s, l } = this.hexToHSL(color.value);

      if (i < 3) {
        // Top 3 colors are primary
        categorized.primary.push({
          name: `primary-${categorized.primary.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      } else if (l > 85 || s < 10) {
        // Light or unsaturated colors are neutral
        categorized.neutral.push({
          name: `neutral-${categorized.neutral.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      } else if (h >= 100 && h <= 150) {
        // Green hues for success
        categorized.semantic.success.push({
          name: `success-${categorized.semantic.success.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      } else if (h >= 0 && h <= 30) {
        // Red hues for error
        categorized.semantic.error.push({
          name: `error-${categorized.semantic.error.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      } else if (h >= 30 && h <= 60) {
        // Yellow/orange hues for warning
        categorized.semantic.warning.push({
          name: `warning-${categorized.semantic.warning.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      } else {
        // Other colors are secondary
        categorized.secondary.push({
          name: `secondary-${categorized.secondary.length + 1}`,
          value: color.value,
          hsl: `hsl(${h}, ${s}%, ${l}%)`
        });
      }
    }

    return categorized;
  }

  hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { h: 0, s: 0, l: 0 };
    }

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  consolidateTypography(typographyArray) {
    const consolidated = {
      fontFamilies: [],
      fontSizes: [],
      fontWeights: [],
      lineHeights: []
    };

    const fontSizeSet = new Set();
    const fontWeightSet = new Set(['400', '500', '600', '700']);

    for (const typo of typographyArray) {
      if (typo.fontSizes) {
        typo.fontSizes.forEach(size => fontSizeSet.add(size));
      }
      if (typo.fontWeights) {
        typo.fontWeights.forEach(weight => fontWeightSet.add(weight));
      }
    }

    // Generate standard font scale
    const baseFontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];
    consolidated.fontSizes = Array.from(fontSizeSet).length > 0
      ? Array.from(fontSizeSet).sort((a, b) => parseInt(a) - parseInt(b))
      : baseFontSizes;

    consolidated.fontWeights = Array.from(fontWeightSet).sort();

    consolidated.fontFamilies = [
      { name: 'primary', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      { name: 'secondary', value: 'Georgia, serif' },
      { name: 'monospace', value: '"Courier New", monospace' }
    ];

    consolidated.lineHeights = ['1', '1.25', '1.5', '1.75', '2'];

    return consolidated;
  }

  generateSpacingScale(spacingValues) {
    // Generate a spacing scale based on detected values
    const baseScale = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

    return {
      scale: baseScale.map((value, index) => ({
        name: `spacing-${index}`,
        value: `${value}px`,
        rem: `${value / 16}rem`
      })),
      patterns: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px'
      }
    };
  }

  generateBorderRadiusTokens() {
    return {
      values: [
        { name: 'none', value: '0' },
        { name: 'sm', value: '4px' },
        { name: 'md', value: '8px' },
        { name: 'lg', value: '12px' },
        { name: 'xl', value: '16px' },
        { name: 'full', value: '9999px' }
      ]
    };
  }

  generateShadowTokens() {
    return {
      levels: [
        { name: 'none', value: 'none' },
        { name: 'sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        { name: 'md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
        { name: 'lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
        { name: 'xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
        { name: '2xl', value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
      ]
    };
  }

  async extractFromImages(imagePaths) {
    const allColors = [];

    for (const imagePath of imagePaths) {
      try {
        const colors = await this.extractColorsFromImage(imagePath);
        allColors.push(...colors);
      } catch (error) {
        console.warn(`Failed to process ${imagePath}:`, error.message);
      }
    }

    return {
      colors: this.categorizeColors(allColors),
      typography: this.consolidateTypography([]),
      spacing: this.generateSpacingScale([]),
      borderRadius: this.generateBorderRadiusTokens(),
      shadows: this.generateShadowTokens()
    };
  }
}

module.exports = new DesignTokenService();
