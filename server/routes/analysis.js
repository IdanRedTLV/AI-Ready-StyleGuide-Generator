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

    // Handle Figma URL if provided
    let figmaFile = null;
    let figmaDesignTokens = null;
    let figmaNodeData = null;

    if (figmaUrl) {
      try {
        console.log(`🔗 Processing Figma URL: ${figmaUrl}`);
        const figmaData = await figmaService.fetchCompleteFrameData(figmaUrl);

        // Save screenshot to temporary file for AI analysis
        const tempDir = path.join(__dirname, '../../uploads');
        const tempFileName = `figma-${Date.now()}.png`;
        const tempFilePath = path.join(tempDir, tempFileName);

        await fs.writeFile(tempFilePath, figmaData.screenshot.buffer);

        figmaFile = {
          originalname: `figma-frame-${figmaData.nodeId}.png`,
          path: tempFilePath,
          fromFigma: true
        };

        // Store the actual Figma design tokens
        figmaDesignTokens = figmaData.designTokens;
        figmaNodeData = figmaData.nodeData;

        console.log(`✅ Figma data fetched: screenshot + design tokens`);
      } catch (figmaError) {
        console.error('Figma processing error:', figmaError);
        return res.status(400).json({
          error: 'Failed to fetch Figma data',
          details: figmaError.message
        });
      }
    }

    // Combine uploaded files and Figma file
    const allFiles = [...uploadedFiles];
    if (figmaFile) {
      allFiles.push(figmaFile);
    }

    console.log(`📸 Analyzing ${allFiles.length} screenshot(s)...`);

    // Analyze each screenshot
    const analysisResults = [];
    for (const file of allFiles) {
      console.log(`🔍 Processing: ${file.originalname}`);

      const analysis = await analysisService.analyzeScreenshot(file.path);
      analysisResults.push({
        filename: file.originalname,
        path: file.path,
        analysis,
        fromFigma: file.fromFigma || false
      });
    }

    // Clean up Figma temporary file if it exists
    if (figmaFile) {
      try {
        await fs.unlink(figmaFile.path);
        console.log('🧹 Cleaned up Figma temporary file');
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary Figma file:', cleanupError.message);
      }
    }

    // Consolidate design tokens from all screenshots
    console.log('🎨 Extracting design tokens...');
    const designTokens = await designTokenService.consolidateTokens(analysisResults);

    // Generate component library structure
    console.log('🧩 Generating component library...');
    const componentLibrary = await analysisService.generateComponentLibrary(analysisResults);

    res.json({
      success: true,
      screenshotsAnalyzed: allFiles.length,
      figmaUrlAnalyzed: !!figmaUrl,
      designTokens,
      componentLibrary,
      analysisResults: analysisResults.map(r => ({
        filename: r.filename,
        components: r.analysis.components,
        summary: r.analysis.summary,
        fromFigma: r.fromFigma
      })),
      // Include actual Figma design tokens if available
      figmaData: figmaDesignTokens ? {
        designTokens: figmaDesignTokens,
        source: 'figma-api',
        note: 'These are the actual design tokens extracted from Figma, not AI-inferred'
      } : null
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
