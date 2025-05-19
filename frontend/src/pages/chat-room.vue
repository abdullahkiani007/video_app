<template>
  <div class="flex h-screen">
    <!-- Left sidebar for user list -->
    <div class="w-64 bg-gray-100 p-4">
      <h2 class="text-xl font-bold mb-4">Online Users</h2>
      <UserList :users="users" />
    </div>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col">
      <!-- Video grid -->
      <div class="flex-1 p-4 bg-gray-900">
        <VideoGrid
          :localStream="localStream"
          :remoteStreams="remoteStreams"
        />
        <div class="absolute bottom-72 left-1/2 transform -translate-x-1/2">
          <CallControls
            :isInCall="isInCall"
            @join-call="joinCall"
            @leave-call="leaveCall"
          />
        </div>
      </div>

      <!-- Chat area -->
      <div class="h-64 bg-white border-t">
        <ChatArea
          :messages="messages"
          @send-message="sendMessage"
        />
      </div>
    </div>
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
      username: ''
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
  },
  beforeUnmount() {
    this.leaveCall();
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
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

      switch (data.type) {
        case 'users':
          // Update online users from WebSocket
          this.onlineUsers = data.users;
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
        case 'offer':
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
        // Request user media with error handling
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        }).catch(error => {
          console.error('Error accessing media devices:', error);
          alert('Could not access camera or microphone. Please check permissions.');
          return null;
        });

        if (!this.localStream) return;

        this.isInCall = true;

        // Notify other users that we've joined the call
        if (this.socket) {
          this.socket.send(JSON.stringify({
            type: 'join-call',
            userId: this.userId
          }));
        }

        // Create peer connections with existing users in call
        this.users.forEach(user => {
          if (user.id !== this.userId && user.inCall) {
            this.createPeerConnection(user.id);
          }
        });
      } catch (error) {
        console.error('Error joining call:', error);
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
      if (this.socket) {
        this.socket.send(JSON.stringify({
          type: 'leave-call',
          userId: this.userId
        }));
      }
    },

    createPeerConnection(remoteUserId: string) {
      try {
        // ICE servers configuration (STUN/TURN)
        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add TURN servers in production for NAT traversal
        ];

        const pc = new RTCPeerConnection({ iceServers });
        this.peerConnections[remoteUserId] = pc;

        // Add local tracks to the connection
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            if (this.localStream) {
              pc.addTrack(track, this.localStream);
            }
          });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && this.socket) {
            this.socket.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate,
              to: remoteUserId,
              from: this.userId
            }));
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
        };

        // Handle incoming tracks
        pc.ontrack = (event) => {
          console.log('Received remote track from:', remoteUserId);
          this.remoteStreams[remoteUserId] = event.streams[0];
          // Force reactivity update
          this.remoteStreams = { ...this.remoteStreams };
        };

        return pc;
      } catch (error) {
        console.error('Error creating peer connection:', error);
        return null;
      }
    },

    async handleOffer(data: any) {
      try {
        const { from, offer } = data;

        // Create peer connection if it doesn't exist
        let pc = this.peerConnections[from];
        if (!pc) {
          pc = this.createPeerConnection(from);
          if (!pc) return;
        }

        // Set remote description
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer
        if (this.socket) {
          this.socket.send(JSON.stringify({
            type: 'answer',
            answer,
            to: from,
            from: this.userId
          }));
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },

    async handleAnswer(data: any) {
      try {
        const { from, answer } = data;
        const pc = this.peerConnections[from];

        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    },

    async handleIceCandidate(data: any) {
      try {
        const { from, candidate } = data;
        const pc = this.peerConnections[from];

        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    },

    handleUserLeft(userId: string) {
      // Close and remove peer connection
      if (this.peerConnections[userId]) {
        this.peerConnections[userId].close();
        delete this.peerConnections[userId];
      }

      // Remove remote stream
      if (this.remoteStreams[userId]) {
        delete this.remoteStreams[userId];
        // Force reactivity update
        this.remoteStreams = { ...this.remoteStreams };
      }
    }
  }
}
</script>