/**
 * Service to handle WebRTC and WebSocket communication for video calls
 */
interface CallServiceOptions {
  userId: string | number;
  username: string;
  onRemoteStreamAdded?: (userId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (userId: string) => void;
  onMessageReceived?: (message: any) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onUsersUpdated?: (users: any[]) => void;
  onTypingStatusChanged?: (userId: string, isTyping: boolean, conversationId: string) => void;
}

export default class CallService {
  private userId: string | number;
  private username: string;
  private socket: WebSocket | null;
  private localStream: MediaStream | null;
  private peerConnections: Record<string, RTCPeerConnection>;
  private remoteStreams: Record<string, MediaStream>;
  private isInCall: boolean;
  private _pendingCandidates: Record<string, RTCIceCandidate[]>;
  private onRemoteStreamAdded: (userId: string, stream: MediaStream) => void;
  private onRemoteStreamRemoved: (userId: string) => void;
  private onMessageReceived: (message: any) => void;
  private onUserJoined: (userId: string) => void;
  private onUserLeft: (userId: string) => void;
  private onUsersUpdated: (users: any[]) => void;
  private onTypingStatusChanged: (userId: string, isTyping: boolean, conversationId: string) => void;

  constructor(options: CallServiceOptions) {
    // Required parameters
    this.userId = options.userId;
    this.username = options.username;

    // Optional callbacks
    this.onRemoteStreamAdded = options.onRemoteStreamAdded || (() => {});
    this.onRemoteStreamRemoved = options.onRemoteStreamRemoved || (() => {});
    this.onMessageReceived = options.onMessageReceived || (() => {});
    this.onUserJoined = options.onUserJoined || (() => {});
    this.onUserLeft = options.onUserLeft || (() => {});
    this.onUsersUpdated = options.onUsersUpdated || (() => {});
    this.onTypingStatusChanged = options.onTypingStatusChanged || (() => {});

    // Internal state
    this.socket = null;
    this.localStream = null;
    this.peerConnections = {};
    this.remoteStreams = {};
    this.isInCall = false;
    this._pendingCandidates = {};
  }

  /**
   * Connect to the WebSocket server
   */
  connectWebSocket() {
    try {
      // Get the base WebSocket URL from environment or use default
      const baseWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      // Connect to the global chat room
      this.socket = new WebSocket(`${baseWsUrl}/ws/chat/global/`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        // Send join room message
        if (this.socket) {
          this.socket.send(JSON.stringify({
            type: 'join',
            userId: this.userId,
            username: this.username
          }));
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleSocketMessage(data: any) {
    if (!data) {
      console.error('Received empty WebSocket message');
      return;
    }

    console.log('Received WebSocket message:', data.type);

    switch (data.type) {
      case 'users':
        // Update online users from WebSocket
        this.onUsersUpdated(data.users || []);
        break;
      case 'message':
        // Transform incoming message to match expected format
        const formattedMessage = {
          id: data.id || Date.now(), // Use server-provided ID or fallback
          sender: data.userId,
          sender_username: data.username,
          content: data.text,
          created_at: data.timestamp || new Date().toISOString()
        };
        this.onMessageReceived(formattedMessage);
        break;
      case 'typing':
        // Handle typing status updates from other users
        console.log("typing status changed for user", data.userId, data.isTyping);
        if (data.userId !== this.userId) {  // Don't process our own typing events
          this.onTypingStatusChanged(data.userId, data.isTyping, 'global');
        }
        break;
      case 'join-call':
        console.log(`User ${data.userId} joined the call`);
        this.onUserJoined(data.userId);

        // If another user joined the call and we're already in the call,
        // we should initiate the connection to them
        if (data.userId !== this.userId && this.isInCall) {
          console.log(`We're already in call, initiating connection to new user ${data.userId}`);

          // Create peer connection if it doesn't exist
          if (!this.peerConnections[data.userId]) {
            this.createPeerConnection(data.userId);
          }

          // Create and send offer - we initiate because we were already in the call
          this.createOfferToUser(data.userId);
        }
        break;
      case 'leave-call':
        this.handleUserLeft(data.userId);
        break;
      case 'offer':
        // Only process offers meant for us
        if (data.targetUserId === this.userId) {
          this.handleOffer(data);
        } else {
          console.log(`Ignoring offer not meant for us (target: ${data.targetUserId})`);
        }
        break;
      case 'answer':
        // Only process answers meant for us
        if (data.targetUserId === this.userId) {
          this.handleAnswer(data);
        } else {
          console.log(`Ignoring answer not meant for us (target: ${data.targetUserId})`);
        }
        break;
      case 'ice-candidate':
        // Only process ICE candidates meant for us
        if (data.targetUserId === this.userId) {
          this.handleIceCandidate(data);
        } else {
          console.log(`Ignoring ICE candidate not meant for us (target: ${data.targetUserId})`);
        }
        break;
      case 'user-left':
        this.handleUserLeft(data.userId);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  /**
   * Send a chat message
   */
  sendMessage(text: string) {
    if (!text.trim() || !this.socket) return;

    // Make sure userId and username are not empty
    if (!this.userId || !this.username) {
      console.error('Cannot send message: User ID or username is missing');
      return;
    }

    // Check socket readiness
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return;
    }

    const message = {
      type: 'message',
      userId: this.userId,
      username: this.username,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Send typing status
   */
  sendTypingStatus(isTyping: boolean) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send typing status');
      return;
    }

    try {
      console.log("sending typing status to websocket");
      this.socket.send(JSON.stringify({
        type: 'typing',
        userId: this.userId,
        username: this.username,
        isTyping: isTyping
      }));
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  }

  /**
   * Join the video call
   */
  async joinCall() {
    try {
      console.log("joining call");

      // Check if we're in Firefox
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

      let videoStream: MediaStream | null = null;

      if (isFirefox) {
        // Firefox fallback: use getUserMedia directly
        try {
          // Try to get a video stream from the camera
          videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          console.log("Using camera stream for Firefox");
        } catch (err) {
          console.warn('Could not access camera in Firefox:', err);
          // Create a canvas-based fallback if camera access fails
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');

          // Draw a simple placeholder
          if (ctx) {
            ctx.fillStyle = '#333333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText(`${this.username}`, 20, 40);
            ctx.fillText('Video unavailable', 20, 80);
          }

          // Get stream from canvas
          videoStream = canvas.captureStream(30); // 30 FPS

          // Add audio if possible
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioStream.getAudioTracks().forEach(track => videoStream?.addTrack(track));
          } catch (e) {
            console.warn('Could not add audio to canvas stream:', e);
          }

          console.log("Using canvas fallback stream for Firefox");
        }
      } else {
        // Chrome and other browsers: use video file as before
        const videoElement = document.createElement('video');
        videoElement.src = 'src/assets/video.webm'; // Adjust path if needed
        videoElement.loop = true;
        videoElement.muted = true;

        // Wait for video to be loaded before capturing
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = resolve;
          videoElement.load();
        });

        // Start playing the video (needed for captureStream)
        await videoElement.play().catch(err => {
          console.error('Error playing video:', err);
          throw new Error('Could not play video file');
        });

        // Capture stream from the video element
        videoStream = videoElement.captureStream();

        // Add audio track if possible
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          audioStream.getAudioTracks().forEach(track => videoStream?.addTrack(track));
        } catch (e) {
          console.warn('Could not add audio to video stream:', e);
        }

        console.log("Using video file stream");
      }

      this.localStream = videoStream;
      this.isInCall = true;

      // Notify others that you've joined
      console.log("Sending join-call message to WebSocket");
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'join-call',
          userId: this.userId,
          username: this.username
        }));
        console.log("Sent join-call message");
      } else {
        console.error('WebSocket not connected, cannot send join-call message');
        throw new Error('WebSocket not connected');
      }

      return this.localStream;
    } catch (error) {
      console.error('Error joining call:', error);
      throw error;
    }
  }

  /**
   * Create a WebRTC peer connection to a user
   */
  createPeerConnection(remoteUserId: string) {
    console.log(`Creating new peer connection to ${remoteUserId}`);

    // Create RTCPeerConnection with ICE servers
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add more STUN/TURN servers as needed for production
      ]
    });

    this.peerConnections[remoteUserId] = pc;

    // Add all local tracks to the connection if we're in a call
    if (this.isInCall && this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection for ${remoteUserId}`);
        if (this.localStream) {
          pc.addTrack(track, this.localStream);
        }
      });
    } else {
      console.log('Not adding local tracks - either not in call or no local stream');
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log(`Received track from ${remoteUserId}:`, event.track.kind);

      // Ensure track is enabled
      if (!event.track.enabled) {
        console.log(`Enabling ${event.track.kind} track from ${remoteUserId}`);
        event.track.enabled = true;
      }

      // Create a new MediaStream if it doesn't exist for this user
      if (!this.remoteStreams[remoteUserId]) {
        console.log("creating new remote stream for ", remoteUserId);
        this.remoteStreams[remoteUserId] = new MediaStream();
        // Notify component about new stream
        this.onRemoteStreamAdded(remoteUserId, this.remoteStreams[remoteUserId]);
      }

      // Add the track to the remote stream
      this.remoteStreams[remoteUserId].addTrack(event.track);

      console.log(`Added ${event.track.kind} track to remote stream for ${remoteUserId}`);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Generated ICE candidate for ${remoteUserId}`);

        // Send the ICE candidate to the remote peer
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'ice-candidate',
            userId: this.userId,
            targetUserId: remoteUserId,
            candidate: event.candidate
          }));
          console.log(`Sent ICE candidate to ${remoteUserId}`);
        } else {
          console.error('WebSocket not connected, cannot send ICE candidate');
        }
      }
    };

    // Log connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${remoteUserId} changed to: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        console.log(`Successfully connected to ${remoteUserId}`);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        console.warn(`Connection to ${remoteUserId} ${pc.connectionState}`);

        // Clean up failed connections
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          this.handleUserLeft(remoteUserId);

          // If still in call, try to reconnect after a delay
          if (this.isInCall) {
            setTimeout(() => {
              if (this.isInCall) {
                console.log(`Attempting to reconnect to ${remoteUserId}`);
                this.createPeerConnection(remoteUserId);
                this.createOfferToUser(remoteUserId);
              }
            }, 2000);
          }
        }
      }
    };

    // Log ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${remoteUserId} changed to: ${pc.iceConnectionState}`);

      // Handle ICE connection failures
      if (pc.iceConnectionState === 'failed') {
        console.warn(`ICE connection to ${remoteUserId} failed, attempting ICE restart`);

        // Try ICE restart if connection fails
        if (pc.restartIce) {
          pc.restartIce();
        } else if (this.isInCall) {
          // Fallback: recreate the connection
          this.handleUserLeft(remoteUserId);
          setTimeout(() => {
            if (this.isInCall) {
              this.createPeerConnection(remoteUserId);
              this.createOfferToUser(remoteUserId);
            }
          }, 1000);
        }
      }
    };

    return pc;
  }

  /**
   * Create and send an offer to a user
   */
  async createOfferToUser(userId: string) {
    console.log(`Creating offer to user ${userId}`);

    // Create peer connection if it doesn't exist
    if (!this.peerConnections[userId]) {
      this.createPeerConnection(userId);
    }

    try {
      const pc = this.peerConnections[userId];

      // Check if connection is in a valid state to create an offer
      if (pc.signalingState === 'stable') {
        // Create offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        await pc.setLocalDescription(offer);

        // Send the offer to the remote peer
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'offer',
            userId: this.userId,
            targetUserId: userId,
            sdp: pc.localDescription
          }));
          console.log(`Sent offer to user ${userId}`);
        } else {
          console.error('WebSocket not connected, cannot send offer');
        }
      } else {
        console.warn(`Cannot create offer - peer connection is in ${pc.signalingState} state`);
      }
    } catch (error) {
      console.error(`Error creating offer to user ${userId}:`, error);
    }
  }

  /**
   * Handle an incoming offer
   */
  async handleOffer(data: any) {
    try {
      // Extract the correct fields from the data
      const from = data.userId;
      const offer = data.sdp;

      if (!from || !offer) {
        console.error('Invalid offer data received:', data);
        return;
      }

      console.log(`Received offer from ${from}:`, offer);

      // Create peer connection if it doesn't exist
      let pc = this.peerConnections[from];
      if (!pc) {
        console.log(`Creating new peer connection for offer from ${from}`);
        pc = this.createPeerConnection(from);
        if (!pc) {
          console.error(`Failed to create peer connection for ${from}`);
          return;
        }
      }

      // Initialize pending candidates array if needed
      if (!this._pendingCandidates) this._pendingCandidates = {};
      if (!this._pendingCandidates[from]) this._pendingCandidates[from] = [];

      // Set remote description
      console.log(`Setting remote description for ${from}`);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`Remote description set for ${from}`);

      // Add local tracks if in call and not already added
      if (this.isInCall && this.localStream) {
        const senders = pc.getSenders();
        const tracksToAdd = this.localStream.getTracks().filter(track =>
          !senders.some(sender => sender.track === track)
        );

        for (const track of tracksToAdd) {
          console.log(`Adding ${track.kind} track to peer connection for ${from} after receiving offer`);
          pc.addTrack(track, this.localStream);
        }
      }

      // Create answer
      console.log(`Creating answer for ${from}`);
      const answer = await pc.createAnswer();
      console.log(`Answer created for ${from}:`, answer);

      await pc.setLocalDescription(answer);
      console.log(`Local description (answer) set for ${from}`);

      // Send answer
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log(`Sending answer to ${from}`);
        this.socket.send(JSON.stringify({
          type: 'answer',
          userId: this.userId,
          targetUserId: from,
          sdp: pc.localDescription
        }));
        console.log(`Answer sent to ${from}`);
      } else {
        console.error('WebSocket not connected, cannot send answer');
      }

      // Apply any pending ICE candidates
      if (this._pendingCandidates[from] && this._pendingCandidates[from].length > 0) {
        console.log(`Applying ${this._pendingCandidates[from].length} pending ICE candidates for ${from}`);
        for (const candidate of this._pendingCandidates[from]) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log(`Successfully added pending ICE candidate for ${from}`);
          } catch (err) {
            console.warn(`Failed to add pending ICE candidate for ${from}:`, err);
          }
        }
        // Clear the pending candidates after applying them
        this._pendingCandidates[from] = [];
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle an incoming answer
   */
  async handleAnswer(data: any) {
    try {
      // Extract the correct fields from the data
      const from = data.userId;
      const answer = data.sdp;

      if (!from || !answer) {
        console.error('Invalid answer data received:', data);
        return;
      }

      console.log(`Received answer from ${from}:`, answer);

      const pc = this.peerConnections[from];
      if (!pc) {
        console.error(`No peer connection found for ${from}`);
        return;
      }

      // Check if we can set the remote description
      if (pc.signalingState === 'have-local-offer') {
        console.log(`Setting remote description (answer) for ${from}`);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Remote description (answer) set for ${from}`);

        // Apply any pending ICE candidates
        if (this._pendingCandidates && this._pendingCandidates[from]) {
          console.log(`Applying ${this._pendingCandidates[from].length} pending ICE candidates for ${from}`);
          for (const candidate of this._pendingCandidates[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log(`Successfully added pending ICE candidate for ${from}`);
            } catch (err) {
              console.warn(`Failed to add pending ICE candidate for ${from}:`, err);
            }
          }
          // Clear the pending candidates after applying them
          this._pendingCandidates[from] = [];
        }
      } else {
        console.warn(`Cannot set remote description in state: ${pc.signalingState}`);

        // If we're in stable state, we might have already processed this answer
        // or there might be a race condition - log it but don't treat as error
        if (pc.signalingState === 'stable') {
          console.log(`Connection already stable with ${from}, ignoring duplicate answer`);
        }
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle an incoming ICE candidate
   */
  async handleIceCandidate(data: any) {
    try {
      // Extract the correct fields from the data
      const from = data.userId;
      const candidate = data.candidate;

      if (!from || !candidate) {
        console.error('Invalid ICE candidate data received:', data);
        return;
      }

      console.log(`Received ICE candidate from ${from}:`, candidate);

      const pc = this.peerConnections[from];
      if (!pc) {
        console.error(`No peer connection found for ${from} to add ICE candidate`);
        return;
      }

      // Initialize pending candidates array if needed
      if (!this._pendingCandidates) this._pendingCandidates = {};
      if (!this._pendingCandidates[from]) this._pendingCandidates[from] = [];

      // Only add candidate if we have a remote description
      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          console.log(`Adding ICE candidate for ${from}`);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`ICE candidate added for ${from}`);
        } catch (err) {
          console.warn(`Failed to add ICE candidate for ${from}:`, err);
          // Store failed candidates too, in case we need to retry
          this._pendingCandidates[from].push(candidate);
        }
      } else {
        console.warn(`Storing ICE candidate - no remote description for ${from} yet`);
        // Store candidates to add later
        this._pendingCandidates[from].push(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  /**
   * Handle a user leaving the call
   */
  handleUserLeft(userId: string) {
    console.log(`Handling user left: ${userId}`);

    // Close and remove peer connection
    if (this.peerConnections[userId]) {
      this.peerConnections[userId].close();
      delete this.peerConnections[userId];
      console.log(`Closed peer connection to ${userId}`);
    }

    // Remove remote stream
    if (this.remoteStreams[userId]) {
      delete this.remoteStreams[userId];
      // Notify component about removed stream
      this.onRemoteStreamRemoved(userId);
      console.log(`Removed remote stream for ${userId}`);
    }

    // Clean up any pending candidates
    if (this._pendingCandidates && this._pendingCandidates[userId]) {
      delete this._pendingCandidates[userId];
    }

    // Notify component about user leaving
    this.onUserLeft(userId);
  }

  /**
   * Leave the call
   */
  leaveCall() {
    // Close all peer connections
    Object.values(this.peerConnections).forEach(pc => pc.close());
    this.peerConnections = {};

    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clear remote streams
    this.remoteStreams = {};
    this.isInCall = false;

    // Notify other users
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'leave-call',
        userId: this.userId
      }));
    }
  }

  /**
   * Clean up resources
   */
  disconnect() {
    this.leaveCall();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Connect to users already in the call
   */
  connectToExistingUsers(usersInCall: string[]) {
    if (!this.isInCall || !usersInCall || usersInCall.length === 0) {
      return;
    }

    console.log(`Creating offers to ${usersInCall.length} users already in call`);
    usersInCall.forEach(userId => {
      if (userId !== this.userId) {
        // Create peer connection if it doesn't exist
        if (!this.peerConnections[userId]) {
          this.createPeerConnection(userId);
        }
        // Create and send offer
        this.createOfferToUser(userId);
      }
    });
  }
}