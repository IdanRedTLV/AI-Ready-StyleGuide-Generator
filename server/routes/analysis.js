const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');
const designTokenService = require('../services/designTokenService');
const figmaService = require('../services/figmaService');
const fs = require('fs').promises;
const path = require('path');

// Analyze uploaded screenshots
router.post('/', async (req, res) => {
  try {
    const uploadedFiles = req.files || [];
    const figmaUrl = req.body.figmaUrl;

    // Check if we have either uploaded files or a Figma URL
    if (uploadedFiles.length === 0 && !figmaUrl) {
      return res.status(400).json({ error: 'No files uploaded or Figma URL provided' });
    }

    // Handle Figma URL - use real Figma data, skip AI analysis
    if (figmaUrl) {
      try {
        console.log(`🔗 Processing Figma URL: ${figmaUrl}`);
        const figmaData = await figmaService.fetchCompleteFrameData(figmaUrl);

        console.log(`✅ Fetched real Figma design tokens`);

        // Format Figma design tokens to match expected structure
        const designTokens = {
          colors: {
            primary: figmaData.designTokens.colors.slice(0, 3).map((c, i) => ({
              name: `primary-${i + 1}`,
              value: c.color,
              hsl: `hsl(0, 0%, ${Math.round((1 - c.opacity) * 100)}%)`,
              opacity: c.opacity
            })),
            secondary: [],
            neutral: figmaData.designTokens.colors.slice(3).map((c, i) => ({
              name: `neutral-${i + 1}`,
              value: c.color,
              opacity: c.opacity
            }))
          },
          typography: {
            fontFamilies: figmaData.designTokens.fonts,
            fontSizes: figmaData.designTokens.fontSizes.map(size => `${size}px`),
            fontWeights: figmaData.designTokens.fontWeights,
            lineHeights: figmaData.designTokens.lineHeights.map(lh => `${lh}px`)
          },
          spacing: {
            scale: figmaData.designTokens.spacing.map(s => `${s}px`),
            patterns: {}
          },
          borderRadius: {
            values: figmaData.designTokens.borderRadius.map((r, i) => ({
              name: `radius-${i + 1}`,
              value: `${r}px`
            }))
          },
          shadows: {
            levels: []
          },
          source: 'figma-api'
        };

        // Return minimal component library (can be enhanced later)
        const componentLibrary = {
          components: [],
          totalComponents: 0,
          source: 'figma-api'
        };

        return res.json({
          success: true,
          screenshotsAnalyzed: 0,
          figmaUrlAnalyzed: true,
          designTokens,
          componentLibrary,
          analysisResults: [],
          dataSource: 'figma-api',
          note: 'Design tokens extracted directly from Figma API'
        });

      } catch (figmaError) {
        console.error('Figma processing error:', figmaError);
        return res.status(400).json({
          error: 'Failed to fetch Figma data',
          details: figmaError.message
        });
      }
    }

    // Handle screenshot uploads - use AI vision analysis
    console.log(`📸 Analyzing ${uploadedFiles.length} screenshot(s) with AI vision...`);

    // Analyze each screenshot
    const analysisResults = [];
    for (const file of uploadedFiles) {
      console.log(`🔍 Processing: ${file.originalname}`);

      const analysis = await analysisService.analyzeScreenshot(file.path);
      analysisResults.push({
        filename: file.originalname,
        path: file.path,
        analysis
      });
    }

    // Consolidate design tokens from all screenshots using AI analysis
    console.log('🎨 Extracting design tokens from AI analysis...');
    const designTokens = await designTokenService.consolidateTokens(analysisResults);

    // Generate component library structure
    console.log('🧩 Generating component library...');
    const componentLibrary = await analysisService.generateComponentLibrary(analysisResults);

    res.json({
      success: true,
      screenshotsAnalyzed: uploadedFiles.length,
      figmaUrlAnalyzed: false,
      designTokens,
      componentLibrary,
      analysisResults: analysisResults.map(r => ({
        filename: r.filename,
        components: r.analysis.components,
        summary: r.analysis.summary
      })),
      dataSource: 'ai-vision',
      note: 'Design tokens inferred from screenshot analysis using Claude Vision API'
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
