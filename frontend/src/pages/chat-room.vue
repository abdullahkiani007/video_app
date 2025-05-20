<template>
  <div class="relative h-screen flex flex-col">
    <!-- Main content area (video) -->
    <div class="flex-1 bg-gray-900 relative">
      <div v-if="isInCall || Object.keys(remoteStreams).length > 0">
        <VideoGrid
          :localStream="localStream"
          :remoteStreams="remoteStreams"
          :users="users"
          :currentUserId="userId"
        />
      </div>
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-white text-xl text-center px-4">Join the call to start video chat</p>
      </div>

      <!-- Call controls -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <CallControls
          :isInCall="isInCall"
          @join-call="joinCall"
          @leave-call="leaveCall"
        />
      </div>

      <!-- Toggle buttons for sidebars -->
      <div class="absolute top-4 left-4">
        <button
          @click="toggleUserList"
          class="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
          title="Toggle user list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>

      <div class="absolute top-4 right-4">
        <button
          @click="toggleChatArea"
          class="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
          title="Toggle chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Left sidebar for user list - slidable and resizable -->
    <div
      class="fixed top-0 left-0 h-full bg-gray-100 w-64 transform transition-transform duration-300 ease-in-out z-20 shadow-lg"
      :class="userListOpen ? 'translate-x-0' : '-translate-x-full'"
      :style="userListOpen ? { width: `${userListWidth}px` } : {}"
    >
      <div class="p-4 h-full relative">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Online Users</h2>
          <button
            @click="toggleUserList"
            class="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <UserList :users="users" :initial-width="userListWidth - 32" />

        <!-- Resize handle -->
        <div
          class="absolute top-0 right-0 w-4 h-full cursor-ew-resize"
          @mousedown="startResizing('userList', $event)"
        >
          <div class="w-1 h-full bg-gray-300 hover:bg-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- Right sidebar for chat - slidable and resizable -->
    <div
      class="fixed top-0 right-0 h-full bg-white w-80 transform transition-transform duration-300 ease-in-out z-20 shadow-lg flex flex-col"
      :class="chatAreaOpen ? 'translate-x-0' : 'translate-x-full'"
      :style="chatAreaOpen ? { width: `${chatAreaWidth}px` } : {}"
    >
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-xl font-bold">Chat</h2>
        <button
          @click="toggleChatArea"
          class="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-hidden flex flex-col relative">
        <ChatArea
          :messages="messages"
          @send-message="sendMessage"
          @typing="handleTyping"
          class="flex-1 overflow-y-auto"
        />

        <!-- Resize handle -->
        <div
          class="absolute top-0 left-0 w-4 h-full cursor-ew-resize"
          @mousedown="startResizing('chatArea', $event)"
        >
          <div class="w-1 h-full bg-gray-300 hover:bg-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- Overlay when sidebars are open on mobile -->
    <div
      v-if="(userListOpen || chatAreaOpen) && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-10"
      @click="closeAllSidebars"
    ></div>
  </div>
</template>

<script lang="ts">
import UserList from '@/components/chat/UserList.vue';
import VideoGrid from '@/components/chat/VideoGrid.vue';
import ChatArea from '@/components/chat/ChatArea.vue';
import CallControls from '@/components/chat/CallControls.vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth'; // Import Pinia user store

export default {
  name: 'ChatRoom',
  components: {
    UserList,
    VideoGrid,
    ChatArea,
    CallControls
  },
  data() {
    return {
      users: [],
      onlineUsers: [],
      allUsers: [],
      messages: [],
      localStream: null as MediaStream | null,
      remoteStreams: {} as Record<string, MediaStream>,
      peerConnections: {} as Record<string, RTCPeerConnection>,
      socket: null as WebSocket | null,
      isInCall: false,
      userId: '',
      username: '',
      _pendingCandidates: {} as Record<string, RTCIceCandidate[]>,
      // New state for sidebar toggles and sizes
      userListOpen: false,
      chatAreaOpen: false,
      isMobile: false,
      userListWidth: 320,
      chatAreaWidth: 380,
      resizing: null,
      minSidebarWidth: 250,
      maxSidebarWidth: 600,
      statusSocket: null
    }
  },
  created() {
    // Get user info from Pinia store
    const authStore = useAuthStore();
    console.log("authStore " , authStore.user)
    this.userId = authStore.user?.id || '';
    this.username = authStore.user?.username || '';

    // Redirect to login if user is not authenticated
    if (!this.userId || !this.username) {
      this.$router.push('/login');
      return;
    }

    // Fetch initial data
    this.fetchUsers();
    this.fetchMessages();
    this.connectWebSocket();
    this.connectStatusWebSocket();

    // Check if device is mobile
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);

    // Load saved sidebar widths from localStorage
    this.loadSavedSidebarWidths();
  },
  mounted() {
    // Add global event listeners for resizing
    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopResizing);
  },
  beforeUnmount() {
    this.leaveCall();
    if (this.socket) {
      this.socket.close();
    }
    window.removeEventListener('resize', this.checkIfMobile);

    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResizing);
  },
  methods: {
    // New methods for sidebar functionality
    toggleUserList() {
      this.userListOpen = !this.userListOpen;
      // Close chat area on mobile when opening user list
      if (this.userListOpen && this.isMobile && this.chatAreaOpen) {
        this.chatAreaOpen = false;
      }
    },
    toggleChatArea() {
      this.chatAreaOpen = !this.chatAreaOpen;
      // Close user list on mobile when opening chat area
      if (this.chatAreaOpen && this.isMobile && this.userListOpen) {
        this.userListOpen = false;
      }
    },
    closeAllSidebars() {
      this.userListOpen = false;
      this.chatAreaOpen = false;
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth < 768;
      // Auto-close sidebars when switching to mobile
      if (this.isMobile && (this.userListOpen && this.chatAreaOpen)) {
        // Keep only one sidebar open on mobile
        this.chatAreaOpen = false;
      }
    },

    // New methods for sidebar resizing
    loadSavedSidebarWidths() {
      try {
        // Load user list width
        const savedUserListWidth = localStorage.getItem('userListWidth');
        if (savedUserListWidth) {
          const width = parseInt(savedUserListWidth);
          if (!isNaN(width) && width >= this.minSidebarWidth && width <= this.maxSidebarWidth) {
            this.userListWidth = width;
          }
        }

        // Load chat area width
        const savedChatAreaWidth = localStorage.getItem('chatAreaWidth');
        if (savedChatAreaWidth) {
          const width = parseInt(savedChatAreaWidth);
          if (!isNaN(width) && width >= this.minSidebarWidth && width <= this.maxSidebarWidth) {
            this.chatAreaWidth = width;
          }
        }
      } catch (error) {
        console.error('Error loading saved sidebar widths:', error);
      }
    },

    startResizing(sidebar, event) {
      if (this.isMobile) return; // Disable resizing on mobile

      this.resizing = sidebar;
      event.preventDefault();
    },

    handleResize(event) {
      if (!this.resizing) return;

      const windowWidth = window.innerWidth;

      if (this.resizing === 'userList') {
        // Calculate new width based on mouse position
        let newWidth = event.clientX;

        // Apply constraints
        newWidth = Math.max(this.minSidebarWidth, Math.min(newWidth, this.maxSidebarWidth));
        newWidth = Math.min(newWidth, windowWidth * 0.5); // Max 50% of window width

        this.userListWidth = newWidth;

        // Save to localStorage
        try {
          localStorage.setItem('userListWidth', newWidth.toString());
        } catch (error) {
          console.error('Error saving user list width:', error);
        }
      } else if (this.resizing === 'chatArea') {
        // For right sidebar, calculate width from right edge
        let newWidth = windowWidth - event.clientX;

        // Apply constraints
        newWidth = Math.max(this.minSidebarWidth, Math.min(newWidth, this.maxSidebarWidth));
        newWidth = Math.min(newWidth, windowWidth * 0.5); // Max 50% of window width

        this.chatAreaWidth = newWidth;

        // Save to localStorage
        try {
          localStorage.setItem('chatAreaWidth', newWidth.toString());
        } catch (error) {
          console.error('Error saving chat area width:', error);
        }
      }
    },

    stopResizing() {
      this.resizing = null;
    },

    async fetchUsers() {
      try {
        const response = await api.getUsers();
        console.log("response " , response)

        if (response.status !== 200) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        console.log("response.data " , response.data)
        this.allUsers = response.data || [];
        // Initialize online users as empty until WebSocket updates
        this.onlineUsers = [];
        // Set users to all users initially
        this.users = this.allUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        // Set empty arrays as fallback
        this.allUsers = [];
        this.onlineUsers = [];
        this.users = [];
      }
    },

    async fetchMessages() {
      try {
        const response = await api.getMessages();

        if (response.status !== 200) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        this.messages = response.data || [];
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Set empty array as fallback
        this.messages = [];
      }
    },

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
            console.log('WebSocket message received:', data); // Log all incoming messages
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
    },

    handleSocketMessage(data: any) {
      if (!data) {
        console.error('Received empty WebSocket message');
        return;
      }

      console.log('Received WebSocket message:', data.type);

      switch (data.type) {
        case 'users':
          // Update online users from WebSocket
          this.onlineUsers = data.users || [];
          // Mark online status in allUsers
          this.updateUserStatus();
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
          this.messages.push(formattedMessage);
          break;

          case 'typing':
          // Handle typing status updates from other users
          console.log(`User ${data.userId} (${data.username}) is ${data.isTyping ? 'typing' : 'not typing'}`);
          if (data.userId !== this.userId) {  // Don't process our own typing events
            this.updateUserTypingStatus(data.userId, data.isTyping, 'global');
          }
          break;

        case 'join-call':
          console.log(`User ${data.userId} joined the call`);

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
          // Always handle offers
          this.handleOffer(data);
          break;
        case 'answer':
          this.handleAnswer(data);
          break;
        case 'ice-candidate':
          this.handleIceCandidate(data);
          break;
        case 'user-left':
          this.handleUserLeft(data.userId);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    },

    updateUserStatus() {
      // Create a map of online user IDs for quick lookup
      const onlineUserIds = new Set(this.onlineUsers.map(user => user.id));

      // Update all users with online status
      this.allUsers = this.allUsers.map(user => ({
        ...user,
        isOnline: onlineUserIds.has(user.id)
      }));

      // Update the users array that's passed to the UserList component
      this.users = this.allUsers;
    },

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

        // Don't add message to local array here - wait for server confirmation
        // The message will be added when received back from the server
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },

    async joinCall() {
      try {
        console.log("joining call");
        console.log("this.userId ", this.userId);

        // Check if we're in Firefox
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        let videoStream;

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
              audioStream.getAudioTracks().forEach(track => videoStream.addTrack(track));
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
            audioStream.getAudioTracks().forEach(track => videoStream.addTrack(track));
          } catch (e) {
            console.warn('Could not add audio to video stream:', e);
          }

          console.log("Using video file stream");
        }

        this.localStream = videoStream;
        this.isInCall = true;

        // Display local video
        if (this.$refs.localVideo) {
          this.$refs.localVideo.srcObject = this.localStream;
        }

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
          return;
        }

        // Add a delay to ensure the join-call message is processed first
        setTimeout(() => {
          // Find all users who are already in the call
          // We need to initiate connections to all users already in the call
          const usersInCall = this.onlineUsers.filter(user =>
            user.inCall && user.userId !== this.userId
          );

          if (usersInCall.length > 0) {
            console.log(`Creating offers to ${usersInCall.length} users already in call`);
            usersInCall.forEach(user => {
              // Create peer connection if it doesn't exist
              if (!this.peerConnections[user.userId]) {
                this.createPeerConnection(user.userId);
              }
              // Create and send offer
              this.createOfferToUser(user.userId);
            });
          } else {
            console.log("No other users in call to connect to");
          }
        }, 1000);
      } catch (error) {
        console.error('Error joining call:', error);
        alert('Failed to join call: ' + (error.message || 'Unknown error'));
      }
    },

    async createOfferToUser(userId) {
      console.log(`Creating offer to user ${userId}`);

      // Create peer connection if it doesn't exist
      if (!this.peerConnections[userId]) {
        this.createPeerConnection(userId);
      }

      try {
        // Create offer
        const offer = await this.peerConnections[userId].createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        await this.peerConnections[userId].setLocalDescription(offer);

        // Send the offer to the remote peer
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'offer',
            userId: this.userId,
            targetUserId: userId,
            sdp: this.peerConnections[userId].localDescription
          }));
          console.log(`Sent offer to user ${userId}`);
        } else {
          console.error('WebSocket not connected, cannot send offer');
        }
      } catch (error) {
        console.error(`Error creating offer to user ${userId}:`, error);
      }
    },

    createPeerConnection(remoteUserId) {
      console.log(`Creating new peer connection to ${remoteUserId}`);

      // Create RTCPeerConnection with ICE servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      });

      this.peerConnections[remoteUserId] = pc;

      // Add all local tracks to the connection if we're in a call
      if (this.isInCall && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track to peer connection for ${remoteUserId}`);
          pc.addTrack(track, this.localStream);
        });
      } else {
        console.log('Not adding local tracks - either not in call or no local stream');
        console.log('isInCall:', this.isInCall);
        console.log('localStream exists:', !!this.localStream);
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log(`Received track from ${remoteUserId}:`, event.track.kind);

        // Create a new MediaStream if it doesn't exist for this user
        if (!this.remoteStreams[remoteUserId]) {
          this.remoteStreams[remoteUserId] = new MediaStream();
          // Force reactivity update
          this.remoteStreams = { ...this.remoteStreams };
        }

        // Add the track to the remote stream
        this.remoteStreams[remoteUserId].addTrack(event.track);

        // Force reactivity update again after adding track
        this.remoteStreams = { ...this.remoteStreams };

        console.log(`Added ${event.track.kind} track to remote stream for ${remoteUserId}`);
        console.log(`Current remote streams:`, Object.keys(this.remoteStreams));
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
    },

    async handleOffer(data) {
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
        if (this._pendingCandidates && this._pendingCandidates[from]) {
          console.log(`Applying ${this._pendingCandidates[from].length} pending ICE candidates for ${from}`);
          for (const candidate of this._pendingCandidates[from]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          delete this._pendingCandidates[from];
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },

    async handleAnswer(data) {
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
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            delete this._pendingCandidates[from];
          }
        } else {
          console.error(`Cannot set remote description in state: ${pc.signalingState}`);
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    },

    async handleIceCandidate(data) {
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

        // Only add candidate if we have a remote description
        if (pc.remoteDescription && pc.remoteDescription.type) {
          console.log(`Adding ICE candidate for ${from}`);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`ICE candidate added for ${from}`);
        } else {
          console.warn(`Skipping ICE candidate - no remote description for ${from} yet`);
          // Store candidates to add later
          if (!this._pendingCandidates) this._pendingCandidates = {};
          if (!this._pendingCandidates[from]) this._pendingCandidates[from] = [];
          this._pendingCandidates[from].push(candidate);
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    },

    handleUserLeft(userId) {
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
        // Force reactivity update
        this.remoteStreams = { ...this.remoteStreams };
        console.log(`Removed remote stream for ${userId}`);
      }

      // Clean up any pending candidates
      if (this._pendingCandidates && this._pendingCandidates[userId]) {
        delete this._pendingCandidates[userId];
      }
    },

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
    },

    connectStatusWebSocket() {
      // Close existing connection if any
      if (this.statusSocket) {
        this.statusSocket.close();
      }

      try {
        // Use the same WebSocket URL pattern as your working chat WebSocket
        const baseWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

        // IMPORTANT: Make sure this endpoint path matches exactly what your backend expects
        // If your backend doesn't have a separate user-status endpoint, you might need to use the same endpoint
        this.statusSocket = new WebSocket(`${baseWsUrl}/ws/user-status/`);

        console.log(`Attempting to connect status WebSocket to: ${baseWsUrl}/ws/user-status/`);

        this.statusSocket.onopen = () => {
          console.log('Status WebSocket connected successfully');
        };

        this.statusSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Status WebSocket message received:', data);
            this.handleStatusMessage(data);
          } catch (error) {
            console.error('Error parsing status WebSocket message:', error);
          }
        };

        this.statusSocket.onclose = (event) => {
          console.log(`Status WebSocket disconnected: code=${event.code}, reason=${event.reason}`);
        };

        this.statusSocket.onerror = (error) => {
          console.error('Status WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect status WebSocket:', error);
      }
    },

    handleStatusMessage(data) {
      if (data.type === 'user_status') {
        // Update user's online status
        this.updateUserOnlineStatus(data.user_id, data.is_online);
      } else if (data.type === 'typing_status') {
        // Update user's typing status
        this.updateUserTypingStatus(data.user_id, data.is_typing, data.conversation_id);
      }
    },

    updateUserOnlineStatus(userId, isOnline) {
      // Update the users array
      this.users = this.users.map(user => {
        if (user.id === userId) {
          return { ...user, isOnline: isOnline };
        }
        return user;
      });
    },

    updateUserTypingStatus(userId, isTyping, conversationId) {
      console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`);

      // Update the users array
      this.users = this.users.map(user => {
        if (user.id === userId) {
          return { ...user, is_typing: isTyping };
        }
        return user;
      });
    },

    sendTypingStatus(isTyping, conversationId) {
      console.log(`Sending typing status: ${isTyping} for conversation ${conversationId}`);

      if (this.statusSocket && this.statusSocket.readyState === WebSocket.OPEN) {
        this.statusSocket.send(JSON.stringify({
          type: 'typing_status',
          is_typing: isTyping,
          conversation_id: conversationId
        }));
      } else {
        console.warn('Status WebSocket not connected, cannot send typing status');
      }
    },

    handleTyping(isTyping) {
      const conversationId = 'global';
      console.log(`Local user is ${isTyping ? 'typing' : 'stopped typing'}`);


      // Always send through main chat WebSocket since we know it's working
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('Sending typing status through main chat WebSocket');
        this.socket.send(JSON.stringify({
          type: 'typing',
          userId: this.userId,
          username: this.username,
          isTyping: isTyping
        }));
      } else {

        console.warn('Main chat WebSocket not connected, cannot send typing status');
      }
    }
  }
}
</script>

<style scoped>
/* Add these styles to the bottom of your existing <style> section */
.cursor-ew-resize {
  cursor: ew-resize;
}
</style>