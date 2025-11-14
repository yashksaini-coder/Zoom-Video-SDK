# Zoom Video SDK Setup Guide - Proper Values

## 🔑 Environment Variables (.env file)

### Required Values:

```env
ZOOM_VIDEO_SDK_KEY=your_actual_sdk_key_here
ZOOM_VIDEO_SDK_SECRET=your_actual_sdk_secret_here
PORT=3000
```

**Where to get these:**
1. Go to https://marketplace.zoom.us/
2. Sign in → "Develop" → "Build App"
3. Choose "Video SDK" app type
4. After creation, go to "App Credentials" tab
5. Copy the **SDK Key** and **SDK Secret**

**Important:** 
- These are long alphanumeric strings (usually 40+ characters)
- Never share these publicly or commit them to git
- They look like: `ZOOM_VIDEO_SDK_KEY=AbCdEf123456GhIjKlMnOpQrStUvWxYz`

---

## 📝 Form Field Values (create-session.html)

### Session Name
- **What it is:** A unique identifier for your video session
- **Example values:**
  - `MyVideoSession`
  - `TeamMeeting-2024`
  - `TestSession123`
- **Rules:**
  - Can contain letters, numbers, hyphens, underscores
  - Should be unique if you want separate sessions
  - Same session name = same session (people can join)

### Your Name (User Identity)
- **What it is:** Your display name in the video session
- **Example values:**
  - `John Doe`
  - `Alice Smith`
  - `User123`
- **Rules:**
  - Can be any string
  - This is how others will see you in the session

### Session Key
- **What it is:** A key to identify/secure the session
- **Example values:**
  - `my-secret-key-123`
  - `team-meeting-key`
  - `test-key-2024`
- **Rules:**
  - Can be any string
  - Used in JWT token generation
  - Should match for people joining the same session
  - Think of it as a "password" for the session

### Role
- **Options:**
  - **Host (0):** Can manage the session, has more control
  - **Participant (1):** Can join and participate, limited control
- **When to use:**
  - Use **Host** if you're creating/starting the session
  - Use **Participant** if you're joining someone else's session

---

## 🎯 Example Scenarios

### Scenario 1: Creating a New Session
```
Session Name: MyFirstSession
Your Name: John Doe
Session Key: secret-key-123
Role: Host (0)
```

### Scenario 2: Joining an Existing Session
```
Session Name: MyFirstSession  (same as host)
Your Name: Jane Smith
Session Key: secret-key-123    (same as host)
Role: Participant (1)
```

### Scenario 3: Testing Locally
```
Session Name: TestSession
Your Name: TestUser
Session Key: test-key-123
Role: Host (0)
```

---

## ✅ Quick Checklist

Before joining a session, make sure:

- [ ] `.env` file exists with valid `ZOOM_VIDEO_SDK_KEY` and `ZOOM_VIDEO_SDK_SECRET`
- [ ] Server is running (`npm start`)
- [ ] Browser has camera/microphone permissions enabled
- [ ] You're using HTTPS in production (required for media access)
- [ ] All form fields are filled out
- [ ] Session Name and Session Key match if joining existing session

---

## 🐛 Common Issues

### "Failed to initialize Zoom Video SDK client"
- **Cause:** SDK scripts didn't load properly
- **Fix:** 
  - Check internet connection
  - Refresh the page
  - Check browser console for errors
  - Make sure CDN URLs are accessible

### "Token generation failed"
- **Cause:** Invalid SDK credentials or missing .env file
- **Fix:**
  - Verify `.env` file exists
  - Check `ZOOM_VIDEO_SDK_KEY` and `ZOOM_VIDEO_SDK_SECRET` are correct
  - Restart server after updating `.env`

### "Cannot access camera/microphone"
- **Cause:** Browser permissions or HTTP (not HTTPS)
- **Fix:**
  - Allow browser permissions when prompted
  - Use HTTPS in production (localhost works with HTTP)
  - Check browser settings for camera/mic permissions

---

## 📚 Additional Resources

- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/)
- [Get Credentials Guide](https://developers.zoom.us/docs/video-sdk/get-credentials/)
- [Zoom Video SDK Web Sample](https://github.com/zoom/videosdk-web-sample)

