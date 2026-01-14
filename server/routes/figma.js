const express = require('express');
const router = express.Router();
const figmaService = require('../services/figmaService');

// Generate Figma style guide
router.post('/generate', async (req, res) => {
  try {
    const { designTokens, componentLibrary, projectName } = req.body;

    if (!designTokens || !componentLibrary) {
      return res.status(400).json({
        error: 'Missing required data: designTokens and componentLibrary are required'
      });
    }

    console.log('🎨 Generating Figma style guide...');

    const figmaOutput = await figmaService.generateStyleGuide({
      designTokens,
      componentLibrary,
      projectName: projectName || 'AI-Generated Style Guide'
    });

    res.json({
      success: true,
      figmaOutput
    });

  } catch (error) {
    console.error('Figma generation error:', error);
    res.status(500).json({
      error: 'Failed to generate Figma style guide',
      details: error.message
    });
  }
});

// Export design tokens in various formats
router.post('/export-tokens', async (req, res) => {
  try {
    const { designTokens, format } = req.body;

    if (!designTokens) {
      return res.status(400).json({ error: 'Design tokens are required' });
    }

    const exportedTokens = figmaService.exportTokens(designTokens, format || 'json');

    res.json({
      success: true,
      format,
      tokens: exportedTokens
    });

  } catch (error) {
    console.error('Token export error:', error);
    res.status(500).json({
      error: 'Failed to export design tokens',
      details: error.message
    });
  }
});

module.exports = router;
