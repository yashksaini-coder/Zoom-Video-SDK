/**
 * Zoom Video SDK Application with Audio Transcription
 * Main application logic for session management and transcription
 */

class ZoomVideoApp {
    constructor() {
        this.client = null;
        this.stream = null;
        this.isJoined = false;
        this.transcriptionManager = null;
        this.audioCapture = null;
        this.currentSession = null;
    }

    /**
     * Initialize Zoom Video SDK client
     */
    async initSDK() {
        try {
            // Wait for SDK to load
            await this.waitForSDK();
            
            // Create client
            let VideoClient = null;
            if (window.WebVideoSDK?.default && typeof window.WebVideoSDK.default.createClient === 'function') {
                VideoClient = window.WebVideoSDK.default;
            } else if (window.ZoomVideo && typeof window.ZoomVideo.createClient === 'function') {
                VideoClient = window.ZoomVideo;
            } else {
                throw new Error('Zoom Video SDK not found');
            }

            this.client = VideoClient.createClient();
            this.client.init('en-US', 'Global', { patchJsMedia: true });
            
            // Initialize transcription manager
            this.transcriptionManager = new TranscriptionManager();
            
            // Initialize audio capture
            this.audioCapture = new AudioCapture();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize SDK:', error);
            throw error;
        }
    }

    /**
     * Wait for SDK to load
     */
    waitForSDK() {
        return new Promise((resolve, reject) => {
            const checkSDK = () => {
                if (window.WebVideoSDK || window.ZoomVideo) {
                    resolve();
                } else {
                    setTimeout(checkSDK, 100);
                }
            };
            
            // Start checking immediately
            checkSDK();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('SDK loading timeout'));
            }, 10000);
        });
    }

    /**
     * Generate JWT token from server
     */
    async generateToken(sessionName, role, sessionKey, userIdentity) {
        try {
            const response = await fetch('/api/generate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionName,
                    role: parseInt(role),
                    sessionKey,
                    userIdentity
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate token');
            }

            return data.token;
        } catch (error) {
            throw new Error(`Token generation failed: ${error.message}`);
        }
    }

    /**
     * Join a video session
     */
    async joinSession(sessionName, token, userName, role) {
        try {
            if (!this.client) {
                await this.initSDK();
            }

            await this.client.join(sessionName, token, userName);
            this.isJoined = true;
            this.currentSession = { sessionName, userName, role };

            // Get media stream
            this.stream = this.client.getMediaStream();

            // Setup event listeners
            this.setupEventListeners();

            // Start media
            await this.startMedia();

            // Start transcription
            await this.transcriptionManager.start(userName);

            return true;
        } catch (error) {
            console.error('Join session error:', error);
            throw error;
        }
    }

    /**
     * Start video and audio
     */
    async startMedia() {
        try {
            // Start video
            await this.stream.startVideo();
            console.log('Video started successfully');

            // Start audio
            await this.stream.startAudio();
            console.log('Audio started successfully');

            // Render own video
            this.renderOwnVideo();

            // Start audio capture for transcription
            await this.audioCapture.start();
            this.audioCapture.onAudioData((audioData) => {
                // Audio data is captured, transcription handles it via microphone
            });

        } catch (error) {
            console.error('Error starting media:', error);
            throw error;
        }
    }

    /**
     * Render own video
     */
    renderOwnVideo() {
        const videoElement = document.getElementById('video-canvas');
        if (!videoElement) return;

        const currentUser = this.client.getCurrentUserInfo();
        if (!currentUser) return;

        const renderVideo = () => {
            try {
                this.stream.attachVideo(videoElement, currentUser.userId);
                console.log('Rendered own video');
            } catch (error) {
                if (error.errorCode !== 6001 && error.errorCode !== 6112) {
                    console.warn('Error rendering video:', error);
                }
            }
        };

        // Wait for video to be active
        const videoActiveHandler = (payload) => {
            if (payload.userId === currentUser.userId && 
                (payload.state === 'Active' || payload.action === 'Start')) {
                setTimeout(renderVideo, 500);
            }
        };
        this.client.on('video-active-change', videoActiveHandler);

        // Fallback
        setTimeout(renderVideo, 1500);
    }

    /**
     * Setup event listeners for session events
     */
    setupEventListeners() {
        const videoElement = document.getElementById('video-canvas');

        // User added
        this.client.on('user-added', (payload) => {
            const user = Array.isArray(payload) ? payload[0] : payload;
            const userName = user.displayName || user.userId || 'Unknown';
            this.transcriptionManager.addUser(user.userId, userName);
            this.onUserAdded(userName);
        });

        // User removed
        this.client.on('user-removed', (payload) => {
            const user = Array.isArray(payload) ? payload[0] : payload;
            const userName = user.displayName || user.userId || 'Unknown';
            this.transcriptionManager.removeUser(user.userId);
            this.onUserRemoved(userName);
        });

        // Peer video state change
        this.client.on('peer-video-state-change', (payload) => {
            if (payload.action === 'Start' && videoElement) {
                setTimeout(() => {
                    try {
                        this.stream.attachVideo(videoElement, payload.userId);
                    } catch (err) {
                        if (err.errorCode !== 6001 && err.errorCode !== 6112) {
                            console.warn('Error attaching peer video:', err);
                        }
                    }
                }, 500);
            }
        });

        // Video active change
        this.client.on('video-active-change', (payload) => {
            if (payload.state === 'Active' && videoElement) {
                setTimeout(() => {
                    try {
                        this.stream.attachVideo(videoElement, payload.userId);
                    } catch (err) {
                        if (err.errorCode !== 6001 && err.errorCode !== 6112) {
                            console.warn('Error attaching video on active change:', err);
                        }
                    }
                }, 500);
            }
        });

        // Connection change
        this.client.on('connection-change', (payload) => {
            if (payload.state === 'Closed') {
                this.leaveSession();
            }
        });

        // Error handling
        this.client.on('error', (error) => {
            console.error('Session error:', error);
            this.onError(error);
        });
    }

    /**
     * Leave session
     */
    async leaveSession() {
        try {
            if (this.transcriptionManager) {
                this.transcriptionManager.stop();
            }

            if (this.audioCapture) {
                this.audioCapture.stop();
            }

            if (this.client && this.isJoined) {
                await this.client.leave();
                this.isJoined = false;
            }

            this.currentSession = null;
            this.onSessionLeft();
        } catch (error) {
            console.error('Error leaving session:', error);
        }
    }

    /**
     * Event callbacks (override in UI)
     */
    onUserAdded(userName) {
        console.log(`User added: ${userName}`);
    }

    onUserRemoved(userName) {
        console.log(`User removed: ${userName}`);
    }

    onError(error) {
        console.error('Session error:', error);
    }

    onSessionLeft() {
        console.log('Session left');
    }
}

/**
 * Transcription Manager using Web Speech API
 */
class TranscriptionManager {
    constructor() {
        this.recognition = null;
        this.isTranscribing = false;
        this.users = new Map();
        this.transcriptions = [];
        this.currentTranscript = '';
        this.speechDetection = new SpeechDetection();
    }

    /**
     * Initialize speech recognition
     */
    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            throw new Error('Speech Recognition API not supported in this browser');
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
            console.log('Transcription started');
            this.isTranscribing = true;
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.handleFinalTranscript(finalTranscript.trim());
            }

            if (interimTranscript) {
                this.handleInterimTranscript(interimTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Not an error, just no speech detected
                return;
            }
            this.onTranscriptionError(event.error);
        };

        this.recognition.onend = () => {
            this.isTranscribing = false;
            // Restart if it was intentionally running
            if (this.shouldContinue) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('Error restarting recognition:', e);
                    }
                }, 100);
            }
        };
    }

    /**
     * Start transcription
     */
    async start(userName) {
        try {
            if (!this.recognition) {
                this.init();
            }

            this.shouldContinue = true;
            this.currentUser = userName;
            this.recognition.start();
            
            console.log('Transcription started for:', userName);
        } catch (error) {
            console.error('Error starting transcription:', error);
            throw error;
        }
    }

    /**
     * Stop transcription
     */
    stop() {
        this.shouldContinue = false;
        if (this.recognition && this.isTranscribing) {
            this.recognition.stop();
        }
        this.isTranscribing = false;
        console.log('Transcription stopped');
    }

    /**
     * Handle final transcript
     */
    handleFinalTranscript(transcript) {
        if (!transcript.trim()) return;

        const timestamp = new Date().toISOString();
        const transcription = {
            id: Date.now(),
            user: this.currentUser || 'Unknown',
            text: transcript,
            timestamp: timestamp,
            confidence: 1.0
        };

        this.transcriptions.push(transcription);
        
        // Log to console
        console.log(`[TRANSCRIPTION] ${transcription.user}: ${transcript}`);
        
        // Detect speech patterns
        const speechInfo = this.speechDetection.analyze(transcript);
        if (speechInfo.hasSpeech) {
            console.log(`[SPEECH DETECTION] Detected: ${speechInfo.type}`, speechInfo);
        }

        // Update UI
        this.onTranscript(transcription);
    }

    /**
     * Handle interim transcript
     */
    handleInterimTranscript(transcript) {
        this.currentTranscript = transcript;
        this.onInterimTranscript(transcript);
    }

    /**
     * Add user to transcription tracking
     */
    addUser(userId, userName) {
        this.users.set(userId, userName);
        console.log(`Added user to transcription: ${userName} (${userId})`);
    }

    /**
     * Remove user from transcription tracking
     */
    removeUser(userId) {
        const userName = this.users.get(userId);
        this.users.delete(userId);
        if (userName) {
            console.log(`Removed user from transcription: ${userName} (${userId})`);
        }
    }

    /**
     * Event callbacks
     */
    onTranscript(transcription) {
        // Override in UI
    }

    onInterimTranscript(transcript) {
        // Override in UI
    }

    onTranscriptionError(error) {
        console.error('Transcription error:', error);
    }
}

/**
 * Speech Detection and Analysis
 */
class SpeechDetection {
    constructor() {
        this.questionPatterns = [
            /\b(what|when|where|who|why|how|can|could|would|should|is|are|do|does|did)\b/i,
            /\?/,
            /\b(please|tell me|explain|describe)\b/i
        ];
        
        this.commandPatterns = [
            /\b(start|stop|begin|end|pause|resume|next|previous)\b/i,
            /\b(show|hide|display|open|close)\b/i
        ];
        
        this.emotionPatterns = {
            positive: [/\b(great|good|excellent|wonderful|amazing|fantastic|love|like)\b/i],
            negative: [/\b(bad|terrible|awful|hate|dislike|worst|horrible)\b/i],
            question: [/\?/],
            exclamation: [/!/]
        };
    }

    /**
     * Analyze speech for patterns
     */
    analyze(text) {
        const result = {
            hasSpeech: text.trim().length > 0,
            type: 'statement',
            isQuestion: false,
            isCommand: false,
            emotion: 'neutral',
            keywords: [],
            wordCount: text.split(/\s+/).length
        };

        // Check for questions
        if (this.questionPatterns.some(pattern => pattern.test(text))) {
            result.isQuestion = true;
            result.type = 'question';
        }

        // Check for commands
        if (this.commandPatterns.some(pattern => pattern.test(text))) {
            result.isCommand = true;
            result.type = 'command';
        }

        // Detect emotion
        for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
            if (patterns.some(pattern => pattern.test(text))) {
                result.emotion = emotion;
                break;
            }
        }

        // Extract keywords (simple approach)
        const words = text.toLowerCase().split(/\s+/);
        result.keywords = words.filter(word => word.length > 4);

        return result;
    }
}

/**
 * Audio Capture for transcription
 */
class AudioCapture {
    constructor() {
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isCapturing = false;
    }

    /**
     * Start audio capture
     */
    async start() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isCapturing = true;

            // Start monitoring audio levels
            this.monitorAudioLevels();

            console.log('Audio capture started');
        } catch (error) {
            console.error('Error starting audio capture:', error);
            throw error;
        }
    }

    /**
     * Monitor audio levels for speech detection
     */
    monitorAudioLevels() {
        if (!this.isCapturing) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average volume
        const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
        
        // Detect if speech is happening (threshold can be adjusted)
        const isSpeaking = average > 30;
        
        if (isSpeaking) {
            this.onAudioData(average);
        }

        requestAnimationFrame(() => this.monitorAudioLevels());
    }

    /**
     * Stop audio capture
     */
    stop() {
        this.isCapturing = false;
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        console.log('Audio capture stopped');
    }

    /**
     * Event callback
     */
    onAudioData(level) {
        // Override in UI for visualization
    }
}

// Export for use in HTML
window.ZoomVideoApp = ZoomVideoApp;
window.TranscriptionManager = TranscriptionManager;
window.SpeechDetection = SpeechDetection;
window.AudioCapture = AudioCapture;

