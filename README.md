# Zoom Video SDK - Session & Transcription Application

A comprehensive web application for creating Zoom Video SDK sessions with real-time audio transcription and speech detection capabilities.

## ✨ Features

- **🎥 Video Sessions**: Create and join Zoom Video SDK sessions
- **🎤 Real-time Transcription**: Live speech-to-text using Web Speech API
- **🔍 Speech Detection**: Advanced speech pattern analysis (questions, commands, emotions)
- **📝 Console Logging**: All transcriptions logged to browser console
- **🎯 Audio Capture**: High-quality audio capture with noise suppression
- **👥 Multi-user Support**: Track transcriptions from multiple participants
- **💻 Modern UI**: Beautiful, responsive interface

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Zoom Video SDK credentials (SDK Key and Secret)
- Modern browser with Web Speech API support (Chrome, Edge, Safari)

## 🚀 Quick Start

### 1. Get Your Zoom Video SDK Credentials

Follow the official guide to get your credentials:
**[Get Zoom Video SDK Credentials](https://developers.zoom.us/docs/video-sdk/get-credentials/)**

Steps:
1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in and navigate to **"Develop"** > **"Build App"**
3. Choose **"Video SDK"** as the app type
4. After creating your app, go to **"App Credentials"** tab
5. Copy your **SDK Key** and **SDK Secret**

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and add your credentials:

```env
ZOOM_VIDEO_SDK_KEY=your_actual_sdk_key
ZOOM_VIDEO_SDK_SECRET=your_actual_sdk_secret
PORT=3000
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Open the Application

Navigate to `http://localhost:3000` in your browser.

## 📖 Usage Guide

### Creating a Session

1. Fill in the session form:
   - **Session Name**: A unique name for your session (letters, numbers, hyphens, underscores only)
   - **Your Name**: Your display name
   - **Session Key**: A secure key for the session (share this with participants)
   - **Role**: Choose Host (can manage) or Participant (join only)

2. Click **"Create & Join Session"**

3. Allow camera and microphone permissions when prompted

### Starting Transcription

1. After joining a session, click **"Start Transcription"**

2. Speak into your microphone - transcriptions will appear in real-time

3. All transcriptions are also logged to the browser console:
   ```
   [TRANSCRIPTION] John Doe: Hello, this is a test
   [SPEECH DETECTION] Detected: question {type: 'question', isQuestion: true, ...}
   ```

4. Click **"Stop Transcription"** to pause

### Speech Detection Features

The application automatically detects:
- **Questions**: Detects question words (what, when, where, etc.) and question marks
- **Commands**: Identifies action words (start, stop, show, hide, etc.)
- **Emotions**: Detects positive/negative sentiment
- **Keywords**: Extracts important words from speech

### Leaving a Session

Click **"Leave Session"** to disconnect from the video session and stop all transcription.

## 🏗️ Project Structure

```
videosdk-exp/
├── server.js              # Express server with JWT token generation
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── public/
│   ├── index.html        # Main application page with transcription UI
│   ├── app.js            # Application logic (Zoom SDK, Transcription, Audio Capture)
│   ├── create-session.html  # Legacy session creation page
│   └── setup-credentials.html # Credentials setup page
└── README.md              # This file
```

## 🔧 API Endpoints

### POST `/api/generate-token`

Generate a JWT token for joining a Zoom Video SDK session.

**Request Body:**
```json
{
  "sessionName": "MySession",
  "role": 1,
  "sessionKey": "my-key",
  "userIdentity": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionName": "MySession",
  "role": 1,
  "userIdentity": "John Doe",
  "expiresIn": 7200
}
```

### GET `/api/health`

Check server status and SDK configuration.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "sdkConfigured": true,
  "keyLength": 45,
  "secretLength": 50
}
```

### POST `/api/validate-credentials`

Validate SDK credentials format.

### POST `/api/validate-session-inputs`

Validate session form inputs.

## 🎯 Transcription Features

### Web Speech API

The application uses the browser's built-in Web Speech API for real-time transcription:
- **Continuous Recognition**: Captures speech continuously
- **Interim Results**: Shows partial results as you speak
- **Final Results**: Commits complete sentences
- **Language Support**: Currently configured for English (en-US)

### Speech Detection

Advanced pattern analysis includes:
- Question detection
- Command recognition
- Emotion analysis
- Keyword extraction

### Console Logging

All transcriptions are logged to the browser console with:
- User identification
- Timestamp
- Full transcript text
- Speech detection analysis

Example console output:
```
[TRANSCRIPTION] John Doe: What time is the meeting?
[SPEECH DETECTION] Detected: question {
  type: 'question',
  isQuestion: true,
  emotion: 'neutral',
  keywords: ['time', 'meeting']
}
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your SDK credentials secure
- JWT tokens expire after 2 hours
- Use HTTPS in production

## 🌐 Browser Compatibility

### Web Speech API Support
- ✅ Chrome/Edge (Chromium): Full support
- ✅ Safari: Full support
- ⚠️ Firefox: Limited support (may require polyfill)

### Zoom Video SDK
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support

## 🐛 Troubleshooting

### Transcription Not Working

1. **Check Browser Support**: Ensure you're using Chrome, Edge, or Safari
2. **Microphone Permissions**: Allow microphone access when prompted
3. **HTTPS Required**: Some browsers require HTTPS for Web Speech API
4. **Check Console**: Look for errors in browser console

### Video Not Showing

1. **Camera Permissions**: Allow camera access
2. **Check Console**: Look for SDK errors
3. **Verify Credentials**: Ensure SDK Key and Secret are correct

### Session Join Failed

1. **Check Credentials**: Verify SDK Key and Secret in `.env`
2. **Check Network**: Ensure you can reach Zoom servers
3. **Check Console**: Look for detailed error messages

## 📚 Resources

- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/web/)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Get Zoom Video SDK Credentials](https://developers.zoom.us/docs/video-sdk/get-credentials/)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues related to:
- **Zoom Video SDK**: [Zoom Developer Forum](https://devforum.zoom.us/)
- **This Application**: Open an issue on GitHub

---

**Built with ❤️ using Zoom Video SDK and Web Speech API**
