# Zoom Video SDK Express Server

A simple Express.js server for managing Zoom Video SDK sessions with HTML pages for creating and joining video conferences.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Zoom Video SDK credentials (SDK Key and Secret)

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

### 5. Open in Browser

Navigate to `http://localhost:3000` to access the application.

## 📁 Project Structure

```
.
├── server.js              # Express server with JWT token generation
├── package.json           # Dependencies and scripts
├── .env.example          # Example environment variables
├── .env                  # Your actual credentials (create this)
├── README.md             # This file
└── public/               # Static HTML files
    ├── index.html        # Landing page with setup instructions
    ├── setup-credentials.html  # Credentials setup and validation page
    └── create-session.html  # Session creation/joining page
```

## 🔧 API Endpoints

### POST `/api/generate-token`

Generates a JWT token for Zoom Video SDK authentication.

**Request Body:**
```json
{
  "sessionName": "MySession",
  "role": 0,
  "sessionKey": "my-session-key",
  "userIdentity": "John Doe"
}
```

**Parameters:**
- `sessionName` (string, required): Name of the session
- `role` (number, required): `0` for host, `1` for participant
- `sessionKey` (string, required): Session identifier key
- `userIdentity` (string, required): User's display name

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionName": "MySession",
  "role": 0,
  "userIdentity": "John Doe",
  "expiresIn": 7200
}
```

### GET `/api/health`

Health check endpoint to verify server status and SDK configuration.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "sdkConfigured": true
}
```

### POST `/api/validate-credentials`

Validates Zoom Video SDK credentials by attempting to generate a test token.

**Request Body:**
```json
{
  "sdkKey": "your_sdk_key",
  "sdkSecret": "your_sdk_secret"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Credentials format is valid. Token generated successfully.",
  "tokenLength": 500
}
```

### POST `/api/validate-session-inputs`

Validates session form inputs before joining a session.

**Request Body:**
```json
{
  "sessionName": "MySession",
  "userIdentity": "John Doe",
  "sessionKey": "my-key",
  "role": 1
}
```

**Response:**
```json
{
  "valid": true,
  "message": "All inputs are valid"
}
```

## 🎥 Using the HTML Pages

### Landing Page (`/`)

The landing page provides:
- Setup instructions
- Link to get credentials
- Server status check
- Navigation to credentials setup and session creation

### Setup Credentials Page (`/setup-credentials.html`)

Features:
- Input fields for SDK Key and Secret
- Real-time format validation
- Test credentials functionality
- Visual indicators for valid/invalid inputs
- Instructions for saving to `.env` file

### Create Session Page (`/create-session.html`)

Features:
- Form to enter session details with **real-time validation**
- Input format checking (session name, user identity, session key)
- Server-side validation before joining
- Real-time video session creation
- Join as host or participant
- Video/audio controls
- Leave session functionality

**How to use:**
1. Enter a session name (e.g., "MyVideoSession")
2. Enter your display name
3. Enter a session key (can be any string)
4. Choose your role (Host or Participant)
5. Click "Join Session"
6. Allow browser permissions for camera/microphone
7. Your video session will start!

## 🔐 Security Notes

- **Never commit your `.env` file** to version control
- Keep your SDK Secret secure
- Tokens expire after 2 hours for security
- Use HTTPS in production

## 📚 Resources

- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/)
- [Get Credentials Guide](https://developers.zoom.us/docs/video-sdk/get-credentials/)
- [Zoom Video SDK Web Sample](https://github.com/zoom/videosdk-web-sample)
- [Zoom Video SDK Auth Endpoint Sample](https://github.com/zoom/videosdk-auth-endpoint-sample)

## 🐛 Troubleshooting

### Server won't start

- Check that `.env` file exists and has valid credentials
- Ensure port 3000 (or your configured port) is not in use
- Verify Node.js version is v14 or higher

### Token generation fails

- Verify your SDK Key and Secret are correct in `.env`
- Check that the credentials are from a Video SDK app (not Meeting SDK)
- Ensure all required parameters are sent in the request

### Video session won't start

- Allow browser permissions for camera and microphone
- Check browser console for errors
- Verify Zoom Video SDK scripts loaded correctly
- Ensure you're using HTTPS in production (required for camera/mic access)

### "SDK credentials are not configured" error

- Make sure `.env` file exists in the project root
- Verify `ZOOM_VIDEO_SDK_KEY` and `ZOOM_VIDEO_SDK_SECRET` are set
- Restart the server after updating `.env`

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

