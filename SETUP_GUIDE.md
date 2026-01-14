# 📚 Setup Guide

Complete guide to setting up the AI-Ready StyleGuide Generator.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Getting API Keys](#getting-api-keys)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **RAM**: Minimum 2GB available
- **Disk Space**: 500MB for dependencies
- **OS**: Windows 10+, macOS 10.14+, or Linux

### Check Your Versions

```bash
node --version
npm --version
```

## Getting API Keys

### Anthropic API Key (Required)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-`)

**Note**: Claude Vision API is required for screenshot analysis.

### Figma API Token (Optional)

1. Log in to [Figma](https://www.figma.com/)
2. Go to **Settings** → **Account**
3. Scroll to **Personal Access Tokens**
4. Click **Generate new token**
5. Give it a name and copy the token

**Note**: Figma token is optional. The app works without it but won't create actual Figma files.

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Ready-StyleGuide-Generator.git
cd AI-Ready-StyleGuide-Generator
```

### 2. Install Backend Dependencies

```bash
npm install
```

This installs:
- Express (web server)
- Multer (file uploads)
- Anthropic SDK (AI analysis)
- Sharp (image processing)
- And more...

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

This installs:
- React (UI framework)
- Axios (HTTP client)
- React Dropzone (file upload)

### 4. Quick Install (Both)

Or use the convenience script:

```bash
npm run install-all
```

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Edit Environment Variables

Open `.env` in your text editor:

```env
# Required: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Figma access token
FIGMA_ACCESS_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 3. Verify Configuration

Check that your `.env` file is not tracked by git:

```bash
git status
```

`.env` should NOT appear in the list (it's in `.gitignore`).

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend together:

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Production Mode

Build and run the optimized version:

```bash
# Build frontend
cd client
npm run build
cd ..

# Start server
npm start
```

The app will be available at http://localhost:5000

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Option 1**: Change the port in `.env`
```env
PORT=5001
```

**Option 2**: Kill the process using the port
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### API Key Issues

**Error**: "Invalid API key"

**Solution**:
1. Check your `.env` file has the correct key
2. Ensure no spaces around the `=` sign
3. Restart the server after changing `.env`

### Module Not Found

**Error**: "Cannot find module..."

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm run install-all
```

### Image Processing Errors

**Error**: "Sharp module error"

**Solution**:
```bash
# Rebuild sharp for your platform
npm rebuild sharp
```

### CORS Errors

**Error**: "Access-Control-Allow-Origin"

**Solution**:
1. Check `CLIENT_URL` in `.env` matches your frontend URL
2. Restart the backend server
3. Clear browser cache

### Upload Fails

**Error**: "File upload failed"

**Possible causes**:
1. File too large (max 10MB)
2. Wrong file format (only images)
3. Missing `uploads/` directory

**Solution**:
```bash
# Create uploads directory
mkdir uploads

# Check file size
ls -lh your-image.png
```

### Memory Issues

**Error**: "JavaScript heap out of memory"

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "AI-Ready StyleGuide Generator API is running"
}
```

### 2. Frontend Access

Open http://localhost:3000 in your browser. You should see the app's landing page.

### 3. Upload Test

1. Open the app
2. Upload a test screenshot
3. Wait for analysis
4. Check for results

## Next Steps

Once setup is complete:

1. Read [Usage Examples](USAGE_EXAMPLES.md)
2. Explore the [API Documentation](API_DOCS.md)
3. Check out [Best Practices](README.md#-best-practices-for-screenshots)

## Getting Help

If you're still having issues:

1. Check [GitHub Issues](https://github.com/yourusername/AI-Ready-StyleGuide-Generator/issues)
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your system info (`node --version`, OS)

---

Happy styling! 🎨
