const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');
const designTokenService = require('../services/designTokenService');

// Analyze uploaded screenshots
router.post('/', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`📸 Analyzing ${req.files.length} screenshot(s)...`);

    // Analyze each screenshot
    const analysisResults = [];
    for (const file of req.files) {
      console.log(`🔍 Processing: ${file.originalname}`);

      const analysis = await analysisService.analyzeScreenshot(file.path);
      analysisResults.push({
        filename: file.originalname,
        path: file.path,
        analysis
      });
    }

    // Consolidate design tokens from all screenshots
    console.log('🎨 Extracting design tokens...');
    const designTokens = await designTokenService.consolidateTokens(analysisResults);

    // Generate component library structure
    console.log('🧩 Generating component library...');
    const componentLibrary = await analysisService.generateComponentLibrary(analysisResults);

    res.json({
      success: true,
      screenshotsAnalyzed: req.files.length,
      designTokens,
      componentLibrary,
      analysisResults: analysisResults.map(r => ({
        filename: r.filename,
        components: r.analysis.components,
        summary: r.analysis.summary
      }))
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze screenshots',
      details: error.message
    });
  }
});

// Get design tokens only
router.post('/tokens', async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const tokens = await designTokenService.extractFromImages(req.files.map(f => f.path));

    res.json({
      success: true,
      designTokens: tokens
    });

  } catch (error) {
    console.error('Token extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract design tokens',
      details: error.message
    });
  }
});

module.exports = router;
