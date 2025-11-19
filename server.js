require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/zoom-sdk', express.static('node_modules/@zoom/videosdk/dist'));

// Validate environment variables
if (!process.env.ZOOM_VIDEO_SDK_KEY || !process.env.ZOOM_VIDEO_SDK_SECRET) {
  console.error('ERROR: ZOOM_VIDEO_SDK_KEY and ZOOM_VIDEO_SDK_SECRET must be set in .env file');
  console.error('Please refer to: https://developers.zoom.us/docs/video-sdk/get-credentials/');
  process.exit(1);
}

// Warn if credentials seem too short
const keyLength = process.env.ZOOM_VIDEO_SDK_KEY.length;
const secretLength = process.env.ZOOM_VIDEO_SDK_SECRET.length;
if (keyLength < 30 || secretLength < 30) {
  console.warn(`\n⚠️  WARNING: SDK credentials seem short (Key: ${keyLength} chars, Secret: ${secretLength} chars)`);
  console.warn('   Typical Zoom Video SDK credentials are 40+ characters long.');
  console.warn('   Please verify you are using Video SDK credentials (not Meeting SDK).');
  console.warn('   Get credentials at: https://developers.zoom.us/docs/video-sdk/get-credentials/\n');
}

/**
 * Generate JWT token for Zoom Video SDK
 * Based on: https://developers.zoom.us/docs/video-sdk/get-credentials/
 */
app.post('/api/generate-token', (req, res) => {
  try {
    const { sessionName, role, sessionKey, userIdentity } = req.body;

    // Validate required fields
    if (!sessionName || role === undefined || !sessionKey || !userIdentity) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['sessionName', 'role', 'sessionKey', 'userIdentity'],
        received: req.body
      });
    }

    // Role: 0 = attendee/participant, 1 = host (per Zoom Video SDK docs)
    const roleType = parseInt(role);
    if (roleType !== 0 && roleType !== 1) {
      return res.status(400).json({
        error: 'Invalid role. Must be 0 (participant) or 1 (host)'
      });
    }

    // Create JWT payload
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 2; // Token valid for 2 hours

    const payload = {
      app_key: process.env.ZOOM_VIDEO_SDK_KEY,
      tpc: sessionName,
      role_type: roleType,
      session_key: sessionKey,
      user_identity: userIdentity,
      version: 1,
      iat: iat,
      exp: exp
    };

    // Log payload for debugging (without sensitive data)
    console.log('JWT Payload:', {
      app_key: process.env.ZOOM_VIDEO_SDK_KEY ? `${process.env.ZOOM_VIDEO_SDK_KEY.substring(0, 10)}...` : 'MISSING',
      tpc: sessionName,
      role_type: roleType,
      session_key: sessionKey,
      user_identity: userIdentity,
      version: 1,
      iat: iat,
      exp: exp
    });

    // Sign the token
    const token = jwt.sign(payload, process.env.ZOOM_VIDEO_SDK_SECRET, {
      algorithm: 'HS256'
    });

    res.json({
      token: token,
      sessionName: sessionName,
      role: roleType,
      userIdentity: userIdentity,
      expiresIn: 7200
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const keyLength = process.env.ZOOM_VIDEO_SDK_KEY ? process.env.ZOOM_VIDEO_SDK_KEY.length : 0;
  const secretLength = process.env.ZOOM_VIDEO_SDK_SECRET ? process.env.ZOOM_VIDEO_SDK_SECRET.length : 0;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sdkConfigured: !!(process.env.ZOOM_VIDEO_SDK_KEY && process.env.ZOOM_VIDEO_SDK_SECRET),
    keyLength: keyLength,
    secretLength: secretLength,
    credentialsWarning: (keyLength < 30 || secretLength < 30) ? 'Credentials seem short. Typical Video SDK keys are 40+ characters.' : null
  });
});

/**
 * Validate credentials by attempting to generate a test token
 */
app.post('/api/validate-credentials', (req, res) => {
  try {
    const { sdkKey, sdkSecret } = req.body;

    if (!sdkKey || !sdkSecret) {
      return res.status(400).json({
        valid: false,
        error: 'Both SDK Key and SDK Secret are required'
      });
    }

    if (sdkKey.length < 20 || sdkSecret.length < 20) {
      return res.status(400).json({
        valid: false,
        error: 'SDK Key and Secret should be at least 20 characters long'
      });
    }

    const testPayload = {
      app_key: sdkKey,
      tpc: 'test-session',
      role_type: 1,
      session_key: 'test-key',
      user_identity: 'test-user',
      version: 1,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60
    };

    try {
      const testToken = jwt.sign(testPayload, sdkSecret, {
        algorithm: 'HS256'
      });

      res.json({
        valid: true,
        message: 'Credentials format is valid. Token generated successfully.',
        tokenLength: testToken.length
      });
    } catch (jwtError) {
      res.status(400).json({
        valid: false,
        error: 'Invalid credentials format. Token generation failed.',
        details: jwtError.message
      });
    }
  } catch (error) {
    console.error('Error validating credentials:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate credentials',
      message: error.message
    });
  }
});

/**
 * Validate session form inputs
 */
app.post('/api/validate-session-inputs', (req, res) => {
  try {
    const { sessionName, userIdentity, sessionKey, role } = req.body;
    const errors = [];

    if (!sessionName || sessionName.trim().length === 0) {
      errors.push('Session Name is required');
    } else if (sessionName.length > 200) {
      errors.push('Session Name must be 200 characters or less');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(sessionName.trim())) {
      errors.push('Session Name can only contain letters, numbers, hyphens, and underscores');
    }

    if (!userIdentity || userIdentity.trim().length === 0) {
      errors.push('Your Name is required');
    } else if (userIdentity.length > 100) {
      errors.push('Your Name must be 100 characters or less');
    }

    if (!sessionKey || sessionKey.trim().length === 0) {
      errors.push('Session Key is required');
    } else if (sessionKey.length > 200) {
      errors.push('Session Key must be 200 characters or less');
    }

    const roleNum = parseInt(role);
    if (isNaN(roleNum) || (roleNum !== 0 && roleNum !== 1)) {
      errors.push('Role must be either Host (1) or Participant (0)');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        valid: false,
        errors: errors
      });
    }

    res.json({
      valid: true,
      message: 'All inputs are valid'
    });
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: 'Validation failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Zoom Video SDK Express Server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure you have set ZOOM_VIDEO_SDK_KEY and ZOOM_VIDEO_SDK_SECRET in your .env file`);
  console.log(`📚 Get credentials at: https://developers.zoom.us/docs/video-sdk/get-credentials/\n`);
});
