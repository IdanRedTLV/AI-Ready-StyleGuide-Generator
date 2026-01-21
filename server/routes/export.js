const express = require('express');
const router = express.Router();

// Export AI-ready documentation
router.post('/ai-context', async (req, res) => {
  try {
    const { aiReadyDocumentation, format = 'json' } = req.body;

    if (!aiReadyDocumentation) {
      return res.status(400).json({ error: 'No documentation provided' });
    }

    if (format === 'json') {
      // Return as pretty-printed JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="design-system-ai-context.json"');
      return res.send(JSON.stringify(aiReadyDocumentation, null, 2));
    }

    if (format === 'markdown') {
      // Convert to markdown
      const markdown = convertToMarkdown(aiReadyDocumentation);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="design-system-ai-context.md"');
      return res.send(markdown);
    }

    return res.status(400).json({ error: 'Invalid format. Use "json" or "markdown"' });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to export documentation',
      details: error.message
    });
  }
});

/**
 * Convert AI-ready documentation to Markdown format
 */
function convertToMarkdown(docs) {
  let md = `# ${docs.metadata.name}\n\n`;
  md += `**Generated:** ${new Date(docs.metadata.generatedAt).toLocaleString()}\n`;
  md += `**Source:** ${docs.metadata.source.type}\n`;
  if (docs.metadata.source.figmaUrl) {
    md += `**Figma URL:** ${docs.metadata.source.figmaUrl}\n`;
  }
  md += `\n---\n\n`;

  // AI Instructions
  md += `## 🤖 AI Instructions\n\n`;
  md += `**Purpose:** ${docs.aiInstructions.purpose}\n\n`;
  md += `### Critical Rules\n\n`;
  docs.aiInstructions.criticalRules.forEach(rule => {
    md += `- ${rule}\n`;
  });
  md += `\n`;

  md += `### How to Use This Documentation\n\n`;
  md += `**Tokens:** ${docs.aiInstructions.howToUse.tokens}\n\n`;
  md += `**Components:** ${docs.aiInstructions.howToUse.components}\n\n`;
  md += `**Patterns:** ${docs.aiInstructions.howToUse.patterns}\n\n`;
  md += `**Accessibility:** ${docs.aiInstructions.howToUse.accessibility}\n\n`;
  md += `\n---\n\n`;

  // Design Tokens
  md += `## 🎨 Design Tokens (W3C Format)\n\n`;

  if (docs.tokens.colors) {
    md += `### Colors\n\n`;
    md += `#### Base Colors\n\n`;
    Object.entries(docs.tokens.colors.base || {}).forEach(([name, token]) => {
      md += `- **${name}**: \`${token.$value}\`\n`;
      md += `  - ${token.$description}\n`;
    });
    md += `\n#### Semantic Colors\n\n`;
    Object.entries(docs.tokens.colors.semantic || {}).forEach(([name, token]) => {
      md += `- **${name}**: \`${token.$value}\`\n`;
      md += `  - ${token.$description}\n`;
    });
    md += `\n`;
  }

  if (docs.tokens.typography) {
    md += `### Typography\n\n`;
    Object.entries(docs.tokens.typography).forEach(([name, token]) => {
      md += `- **${name}**: \`${token.$value}\`\n`;
      md += `  - ${token.$description}\n`;
    });
    md += `\n`;
  }

  if (docs.tokens.spacing) {
    md += `### Spacing\n\n`;
    Object.entries(docs.tokens.spacing).forEach(([name, token]) => {
      md += `- **${name}**: \`${token.$value}\`\n`;
      md += `  - ${token.$description}\n`;
    });
    md += `\n`;
  }

  md += `\n---\n\n`;

  // Components
  md += `## 🧩 Components\n\n`;
  docs.components.forEach(component => {
    md += `### ${component.name}\n\n`;
    md += `${component.description}\n\n`;

    md += `#### Anatomy\n\n`;
    component.anatomy.forEach(part => {
      md += `- **${part.part}** (${part.type})${part.required ? ' - *Required*' : ''}\n`;
      md += `  - ${part.description}\n`;
    });
    md += `\n`;

    md += `#### Design Tokens\n\n`;
    md += `\`\`\`json\n${JSON.stringify(component.tokens, null, 2)}\n\`\`\`\n\n`;

    md += `#### Composition Rules\n\n`;
    md += `✅ **Can Contain:** ${component.compositionRules.canContain.join(', ')}\n\n`;
    md += `❌ **Cannot Contain:** ${component.compositionRules.cannotContain.join(', ')}\n\n`;
    md += `📏 **Max Nesting:** ${component.compositionRules.maxNesting}\n\n`;

    md += `#### Usage Guidelines\n\n`;
    md += `**Do:**\n\n`;
    component.usage.do.forEach(item => {
      md += `- ✅ ${item}\n`;
    });
    md += `\n**Don't:**\n\n`;
    component.usage.dont.forEach(item => {
      md += `- ❌ ${item}\n`;
    });
    md += `\n`;

    if (component.usage.commonMistakes && component.usage.commonMistakes.length > 0) {
      md += `**Common Mistakes:**\n\n`;
      component.usage.commonMistakes.forEach(mistake => {
        md += `- **${mistake.mistake}**\n`;
        md += `  - ❌ Wrong: \`${mistake.wrong}\`\n`;
        md += `  - ✅ Correct: \`${mistake.correct}\`\n`;
        md += `  - Why: ${mistake.why}\n`;
      });
      md += `\n`;
    }

    md += `#### Accessibility\n\n`;
    md += `- **Role:** \`${component.accessibility.role}\`\n`;
    md += `- **Required Attributes:** ${component.accessibility.requiredAttributes.join(', ')}\n`;
    md += `- **Keyboard Navigation:**\n`;
    Object.entries(component.accessibility.keyboard).forEach(([key, action]) => {
      md += `  - **${key}:** ${action}\n`;
    });
    md += `- **Minimum Contrast:** ${component.accessibility.minContrast}\n`;
    md += `- **Focus Indicator:** ${component.accessibility.focusIndicator.required ? 'Required' : 'Optional'} - ${component.accessibility.focusIndicator.style}\n\n`;

    if (component.responsive && Object.keys(component.responsive).length > 0) {
      md += `#### Responsive Behavior\n\n`;
      Object.entries(component.responsive).forEach(([breakpoint, config]) => {
        md += `**${breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}** (${config.breakpoint}):\n`;
        Object.entries(config.rules).forEach(([rule, value]) => {
          md += `- ${rule}: ${value}\n`;
        });
        md += `\n`;
      });
    }

    md += `#### Code Example\n\n`;
    md += `\`\`\`html\n${component.codeExample}\n\`\`\`\n\n`;
    md += `---\n\n`;
  });

  // Global Rules
  md += `## 📋 Global Rules\n\n`;
  Object.entries(docs.rules).forEach(([ruleName, rule]) => {
    md += `### ${ruleName.charAt(0).toUpperCase() + ruleName.slice(1).replace(/([A-Z])/g, ' $1')}\n\n`;
    md += `**Rule:** ${rule.rule}\n\n`;
    md += `**Enforcement:** ${rule.enforcement || 'recommended'}\n\n`;
    if (rule.requirements) {
      md += `**Requirements:**\n`;
      if (typeof rule.requirements === 'object') {
        Object.entries(rule.requirements).forEach(([key, value]) => {
          md += `- **${key}:** ${value}\n`;
        });
      }
      md += `\n`;
    }
    if (rule.examples) {
      md += `**Examples:**\n`;
      md += `- ✅ Correct: \`${rule.examples.correct}\`\n`;
      md += `- ❌ Wrong: \`${rule.examples.wrong}\`\n`;
      if (rule.examples.why) {
        md += `- Why: ${rule.examples.why}\n`;
      }
      md += `\n`;
    }
  });

  md += `---\n\n`;
  md += `*Generated by AI-Ready StyleGuide Generator*\n`;
  md += `*Use this documentation as context when generating UI code with AI assistants*\n`;

  return md;
}

module.exports = router;
