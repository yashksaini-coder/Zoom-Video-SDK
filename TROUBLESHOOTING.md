# Troubleshooting: "JOIN_MEETING_FAILED" Error

## 🔴 Error Details

```
{
    "type": "JOIN_MEETING_FAILED",
    "reason": "This account does not exist or does not belong to you",
    "errorCode": 200
}
```

## 📋 What This Error Means

This error indicates that **Zoom Video SDK rejected your authentication attempt**. The SDK received your JWT token but determined that:

1. **Invalid Credentials**: The SDK Key and/or SDK Secret in your `.env` file are incorrect
2. **Account Mismatch**: The credentials don't belong to your Zoom account
3. **App Not Activated**: Your Video SDK app might not be activated in Zoom Marketplace
4. **Wrong App Type**: You might be using Meeting SDK credentials instead of Video SDK credentials

## 🔍 Why This Occurred

### Most Common Causes:

1. **Missing or Invalid `.env` File**
   - The `.env` file doesn't exist
   - The `.env` file has placeholder values (like `your_sdk_key_here`)
   - The credentials are incorrect or incomplete

2. **Wrong Credentials**
   - Using Meeting SDK credentials instead of Video SDK credentials
   - Copy-paste errors (extra spaces, missing characters)
   - Credentials from a different Zoom account

3. **App Not Properly Configured**
   - Video SDK app not activated in Zoom Marketplace
   - App credentials not generated yet
   - App suspended or deleted

4. **JWT Token Issues**
   - Token generated with wrong credentials
   - Token expired (though this would show a different error)
   - Token payload structure incorrect

## ✅ How to Fix It

### Step 1: Verify Your `.env` File

Check that your `.env` file exists and has valid credentials:

```bash
# Windows
type .env

# Mac/Linux
cat .env
```

Your `.env` should look like:
```env
ZOOM_VIDEO_SDK_KEY=AbCdEf1234567890GhIjKlMnOpQrStUvWxYz1234567890
ZOOM_VIDEO_SDK_SECRET=1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
PORT=3000
```

**Important:**
- No spaces around the `=` sign
- No quotes around the values
- Values should be 40+ character alphanumeric strings
- Make sure you're using **Video SDK** credentials, not Meeting SDK

### Step 2: Get Valid Video SDK Credentials

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click **"Develop"** → **"Build App"**
4. Select **"Video SDK"** (NOT Meeting SDK)
5. Fill in the app details and create it
6. Go to **"App Credentials"** tab
7. Copy the **SDK Key** and **SDK Secret**
8. Make sure the app is **Activated** (not in development mode if you need production access)

### Step 3: Update Your `.env` File

Replace the placeholder values with your actual credentials:

```env
ZOOM_VIDEO_SDK_KEY=paste_your_actual_sdk_key_here
ZOOM_VIDEO_SDK_SECRET=paste_your_actual_sdk_secret_here
PORT=3000
```

### Step 4: Restart Your Server

After updating `.env`, restart your server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### Step 5: Test Your Credentials

Use the credentials validation page:

1. Go to `http://localhost:3000/setup-credentials.html`
2. Enter your SDK Key and Secret
3. Click "Test Credentials"
4. If validation fails, double-check your credentials

## 🔧 Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `ZOOM_VIDEO_SDK_KEY` is set (40+ characters)
- [ ] `ZOOM_VIDEO_SDK_SECRET` is set (40+ characters)
- [ ] No spaces around `=` in `.env` file
- [ ] Using **Video SDK** credentials (not Meeting SDK)
- [ ] Credentials copied correctly (no extra spaces)
- [ ] Server restarted after updating `.env`
- [ ] Video SDK app is activated in Zoom Marketplace

## 🧪 Testing Without Valid Credentials

If you don't have valid credentials yet, you can:

1. **Test the UI/Flow**: The form validation and UI will work
2. **Test Token Generation**: The server will generate tokens (but they'll be rejected by Zoom)
3. **See This Error**: You'll get the authentication error (which is expected)

To fully test session creation, you **must** have valid Video SDK credentials.

## 📚 Additional Resources

- [Get Zoom Video SDK Credentials](https://developers.zoom.us/docs/video-sdk/get-credentials/)
- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/)
- [Zoom Developer Forum](https://devforum.zoom.us/)

## 🆘 Still Having Issues?

If you've verified all the above and still get the error:

1. **Double-check credentials** - Copy them fresh from Zoom Marketplace
2. **Check app status** - Ensure your Video SDK app is activated
3. **Verify app type** - Make sure it's "Video SDK" not "Meeting SDK"
4. **Check server logs** - Look for any errors in the console
5. **Test token generation** - Use `/api/validate-credentials` endpoint

## 💡 Common Mistakes

1. ❌ Using Meeting SDK credentials instead of Video SDK
2. ❌ Having spaces in `.env` file: `KEY = value` (should be `KEY=value`)
3. ❌ Using quotes: `KEY="value"` (should be `KEY=value`)
4. ❌ Not restarting server after updating `.env`
5. ❌ Using credentials from a different Zoom account
6. ❌ App not activated in Zoom Marketplace

