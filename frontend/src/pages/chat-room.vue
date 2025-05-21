<template>
  <div class="relative h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
    <!-- Main content area (video) -->
    <div class="flex-1 relative overflow-hidden">
      <div v-if="isInCall || Object.keys(remoteStreams).length > 0" class="h-full p-2 md:p-4">
        <VideoGrid
          :localStream="localStream"
          :remoteStreams="remoteStreams"
          :users="users"
          :currentUserId="userId"
        />
      </div>
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center p-8 bg-gray-800/30 rounded-xl max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p class="text-white text-xl font-medium">Ready to start your call?</p>
          <p class="mt-2 text-gray-400">Click the join button below to begin</p>
        </div>
      </div>

      <!-- Call controls -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-20">
        <CallControls
          :isInCall="isInCall"
          @join-call="joinCall"
          @leave-call="leaveCall"
          class="bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg"
        />
      </div>

      <!-- Sidebar toggle button -->
      <div class="absolute top-4 left-4 z-30">
        <button
          @click="toggleSidebar"
          class="bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-lg"
          title="Toggle Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Room info badge -->
      <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div class="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{{ totalParticipants }} {{ totalParticipants === 1 ? 'participant' : 'participants' }}</span>
        </div>
      </div>
    </div>

    <!-- Sidebar component -->
    <Sidebar
      :isOpen="sidebarOpen"
      :width="sidebarWidth"
      :username="username"
      :users="users"
      :onlineUsers="onlineUsers"
      :messages="messages"
      :typingUsers="typingUsers"
      @close="toggleSidebar"
      @send-message="sendMessage"
      @typing="handleTyping"
      @logout="logout"
      @resize="handleSidebarResize"
      class="z-40 shadow-xl"
    />

    <!-- Overlay when sidebar is open on mobile -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script>
import UserList from '@/components/chat/UserList.vue';
import VideoGrid from '@/components/chat/VideoGrid.vue';
import ChatArea from '@/components/chat/ChatArea.vue';
import CallControls from '@/components/chat/CallControls.vue';
import chatService from '@/services/chatService';
import userService from '@/services/userService';
import { useAuthStore } from '@/stores/auth'; // Import Pinia user store
import CallService from '@/services/CallService';
import Sidebar from '@/components/chat/Sidebar.vue';

export default {
  name: 'ChatRoom',
  components: {
    UserList,
    VideoGrid,
    ChatArea,
    CallControls,
    Sidebar
  },
  data() {
    return {
      users: [],
      onlineUsers: [],
      allUsers: [],
      messages: [],
      localStream: null,
      remoteStreams: {},
      socket: null,
      isInCall: false,
      userId: '',
      username: '',
      // New state for sidebar toggles and sizes
      sidebarOpen: false,
      isMobile: false,
      sidebarWidth: 320,
      resizing: null,
      minSidebarWidth: 250,
      maxSidebarWidth: 600,
      statusSocket: null,
      remoteVideoRefs: {},
      callService: null,
      currentConversationId: '', // Added to track current conversation
      chatService: null,
      userService: null,
      typingUsers: [],
      resizeDebounceTimer: null,
      // New properties for tracking online users
      onlineUserActivityMap: {},
      onlineUserRefreshInterval: null,
      onlineUserTimeoutMs: 60000, // 1 minute timeout for inactivity
      onlineUserRefreshMs: 30000, // Refresh online users every 30 seconds
    }
  },
  created() {
    // Get user info from Pinia store
    const authStore = useAuthStore();
    this.userId = authStore.user?.id || '';
    this.username = authStore.user?.username || '';

    // Redirect to login if user is not authenticated
    if (!this.userId || !this.username) {
      this.$router.push('/login');
      return;
    }

    // Initialize services
    this.chatService = chatService;
    this.userService = userService;

    // Initialize CallService
    this.callService = new CallService({
      userId: this.userId,
      username: this.username,
      onRemoteStreamAdded: this.handleRemoteStreamAdded,
      onRemoteStreamRemoved: this.handleRemoteStreamRemoved,
      onMessageReceived: this.handleMessageReceived,
      onUserJoined: this.handleUserJoined,
      onUserLeft: this.handleUserLeft,
      onUsersUpdated: this.handleUsersUpdated,
      onTypingStatusChanged: this.handleTypingStatusChanged
    });

    // Fetch initial data
    this.fetchUsers();
    this.fetchMessages();

    // Connect to WebSocket
    this.callService.connectWebSocket();

    // Check if device is mobile
    this.checkIfMobile();
    this.resizeDebounceTimer = null;
    window.addEventListener('resize', this.handleResize);

    // Load saved sidebar widths from localStorage
    this.loadSavedSidebarWidths();

    // Initialize online user refresh interval
    this.startOnlineUserRefresh();
  },
  mounted() {
    // Add global event listeners for resizing
    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopResizing);

    // Handle autoplay restrictions
    document.addEventListener('click', this.handleUserInteraction, { once: true });
    document.addEventListener('touchstart', this.handleUserInteraction, { once: true });
  },
  beforeUnmount() {
    // Clean up CallService
    if (this.callService) {
      this.callService.disconnect();
    }

    window.removeEventListener('resize', this.handleResize);

    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResizing);

    // Clear online user refresh interval
    this.stopOnlineUserRefresh();
  },
  methods: {
    // New methods for CallService integration
    handleRemoteStreamAdded(userId, stream) {
      console.log(`Remote stream added for user ${userId}`);
      this.remoteStreams[userId] = stream;
      // Force reactivity update
      this.remoteStreams = { ...this.remoteStreams };

      // Try to play the video immediately if element exists
      this.$nextTick(() => {
        const videoEl = this.remoteVideoRefs[userId];
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play().catch(err => {
            console.warn(`Could not play remote video for ${userId}:`, err);
          });
        }
      });
    },

    handleRemoteStreamRemoved(userId) {
      console.log(`Remote stream removed for user ${userId}`);
      delete this.remoteStreams[userId];
      // Force reactivity update
      this.remoteStreams = { ...this.remoteStreams };
    },

    handleMessageReceived(message) {
      this.messages.push(message);

      // Update sender's activity status
      if (message.userId && message.userId !== this.userId) {
        this.updateUserActivity(message.userId);
      }
    },

    handleUserJoined(userId) {
      console.log(`User ${userId} joined the call`);
      // Update user's activity status
      this.updateUserActivity(userId);
    },

    handleUserLeft(userId) {
      console.log(`User ${userId} left the call`);
      // Update user status in the UI if needed
    },

    handleUsersUpdated(users) {
      // Update online users from WebSocket
      if (Array.isArray(users)) {
        users.forEach(user => {
          // Update activity for each user from the WebSocket
          const userId = typeof user === 'object' ? user.id : user;
          if (userId && userId !== this.userId) {
            this.updateUserActivity(userId);
          }
        });
      }

      console.log('Online users updated from WebSocket');
      // Refresh online users list
      this.refreshOnlineUsers();
    },

    handleTypingStatusChanged(userId, isTyping, conversationId) {

      // Update user's activity status
      if (userId && userId !== this.userId) {
        this.updateUserActivity(userId);
      }

      // Find the username for this user ID
      const user = this.users.find(user => user.id === userId);
      const username = user ? user.username : `User ${userId}`;

      // Update typing users array
      if (isTyping) {
        // Add user to typing users if not already there
        if (!this.typingUsers.includes(username)) {
          this.typingUsers.push(username);
        }
      } else {
        // Remove user from typing users
        this.typingUsers = this.typingUsers.filter(name => name !== username);
      }

      // Also update the users array for UI consistency
      this.users = this.users.map(user => {
        if (user.id === userId) {
          return { ...user, is_typing: isTyping };
        }
        return user;
      });
    },

    // New methods for sidebar functionality
    toggleSidebar() {
      // Toggle sidebar
      this.sidebarOpen = !this.sidebarOpen;
    },
    checkIfMobile() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 768;

      // Only auto-close sidebar when switching from desktop to mobile
      if (!wasMobile && this.isMobile && this.sidebarOpen) {
        this.sidebarOpen = false;
      }
    },

    // Methods for sidebar resizing
    loadSavedSidebarWidths() {
      try {
        // Load sidebar width
        const savedSidebarWidth = localStorage.getItem('sidebarWidth');
        if (savedSidebarWidth) {
          const width = parseInt(savedSidebarWidth);
          if (!isNaN(width) && width >= this.minSidebarWidth && width <= this.maxSidebarWidth) {
            this.sidebarWidth = width;
          }
        }
      } catch (error) {
        console.error('Error loading saved sidebar width:', error);
      }
    },

    startResizing(event) {
      if (this.isMobile) return; // Disable resizing on mobile

      this.resizing = 'sidebar';
      event.preventDefault();
    },

    handleResize() {
      // Clear previous timer
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer);
      }

      // Set new timer
      this.resizeDebounceTimer = setTimeout(() => {
        this.checkIfMobile();
      }, 250); // 250ms debounce
    },

    stopResizing() {
      this.resizing = null;
    },

    async fetchUsers() {
      try {
        const response = await userService.getUsers();

        if (response.status !== 200) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
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
        const response = await chatService.getMessages();

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

    updateUserStatus() {
      if (!Array.isArray(this.allUsers) || !Array.isArray(this.onlineUsers)) {
        console.warn('Invalid users arrays:', { allUsers: this.allUsers, onlineUsers: this.onlineUsers });
        return;
      }

      // Create a map of online user IDs for quick lookup
      const onlineUserIds = new Set();
      this.onlineUsers.forEach(userId => {
        // Handle both object format and primitive format
        const id = typeof userId === 'object' ? userId.id : userId;
        if (id) onlineUserIds.add(id);
      });

      // Add current user to online users
      onlineUserIds.add(this.userId);


      // Update all users with online status
      this.users = this.allUsers.map(user => ({
        ...user,
        isOnline: onlineUserIds.has(user.id)
      }));

    },

    sendMessage(text) {
      if (!text.trim()) return;
      if (this.callService) {
        this.callService.sendMessage(text);
      }
    },

    async joinCall() {
      try {
        if (!this.callService) {
          throw new Error('Call service not initialized');
        }

        // Join call using CallService
        this.localStream = await this.callService.joinCall();
        this.isInCall = true;

        // Find users already in call to connect to
        const usersInCall = this.users.filter(user =>
          user.inCall && user.userId !== this.userId
        );

        // Connect to existing users in call
        if (usersInCall.length > 0) {
          setTimeout(() => {
            if (this.callService) {
              this.callService.connectToExistingUsers(usersInCall.map(user => user.userId));
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error joining call:', error);
        alert('Failed to join call: ' + (error.message || 'Unknown error'));
      }
    },

    leaveCall() {
      if (this.callService) {
        this.callService.leaveCall();
        this.localStream = null;
        this.isInCall = false;
        this.remoteStreams = {};
      }
    },

    getUsernameById(userId) {
      const user = this.users.find(u => u.userId === parseInt(userId));
      return user ? user.username : `User ${userId}`;
    },

    handleUserInteraction() {
      console.log('User interaction detected, attempting to play all videos');

      // Try to play all remote videos
      for (const userId in this.remoteVideoRefs) {
        const videoEl = this.remoteVideoRefs[userId];
        if (videoEl && videoEl.paused) {
          videoEl.play().catch(err => {
            console.warn(`Could not play remote video for ${userId}:`, err);
          });
        }
      }
    },

    handleTyping(isTyping) {
      if (this.callService) {
        this.callService.sendTypingStatus(isTyping);
      }
    },

    logout() {
      // Implement logout functionality
    },

    // Updated method to handle sidebar resize
    handleSidebarResize(newWidth) {
      if (!this.isMobile && newWidth >= this.minSidebarWidth && newWidth <= this.maxSidebarWidth) {
        this.sidebarWidth = newWidth;

        // Save to localStorage for persistence
        try {
          localStorage.setItem('sidebarWidth', newWidth.toString());
        } catch (error) {
          console.error('Error saving sidebar width:', error);
        }
      }
    },

    // New methods for online user tracking
    startOnlineUserRefresh() {
      // Clear any existing interval
      this.stopOnlineUserRefresh();

      // Start a new interval
      this.onlineUserRefreshInterval = setInterval(() => {
        this.refreshOnlineUsers();
      }, this.onlineUserRefreshMs);

      // Initial refresh
      this.refreshOnlineUsers();
    },

    stopOnlineUserRefresh() {
      if (this.onlineUserRefreshInterval) {
        clearInterval(this.onlineUserRefreshInterval);
        this.onlineUserRefreshInterval = null;
      }
    },

    refreshOnlineUsers() {
      const now = Date.now();
      const activeUserIds = [];

      // Check which users are still active within the timeout period
      for (const [userId, lastActivity] of Object.entries(this.onlineUserActivityMap)) {
        if (now - lastActivity <= this.onlineUserTimeoutMs) {
          activeUserIds.push(userId);
        }
      }

      // Always include current user
      if (!activeUserIds.includes(this.userId)) {
        activeUserIds.push(this.userId);
        this.updateUserActivity(this.userId);
      }

      // Update online users list
      this.onlineUsers = activeUserIds;

      // Update user status in UI
      this.updateUserStatus();

      console.log('Refreshed online users:', activeUserIds);
    },

    updateUserActivity(userId) {
      // Safely handle both string and object user IDs
      const id = typeof userId === 'object' ? userId.id : userId;

      if (!id) {
        console.warn('Invalid user ID for activity update:', userId);
        return;
      }

      // Update last activity timestamp
      this.onlineUserActivityMap[id] = Date.now();

      // Add to online users if not already there
      if (!this.onlineUsers.includes(id)) {
        this.onlineUsers = [...this.onlineUsers, id];
        this.updateUserStatus();
      }
    },
  },
  computed: {
    totalParticipants() {
      return (this.localStream ? 1 : 0) + Object.keys(this.remoteStreams).length;
    }
  },
  watch: {
    remoteStreams: {
      deep: true,
      handler(newStreams) {
        console.log('Remote streams updated:', Object.keys(newStreams));
        // Use nextTick to ensure DOM is updated
        this.$nextTick(() => {
          for (const userId in newStreams) {
            const videoEl = this.remoteVideoRefs[userId];
            const stream = newStreams[userId];

            if (videoEl && stream && videoEl.srcObject !== stream) {
              console.log(`Setting srcObject for user ${userId}`);
              videoEl.srcObject = stream;

              // Force play (might be needed for some browsers)
              videoEl.play().catch(err => {
                console.warn(`Could not play remote video for ${userId}:`, err);
              });
            }
          }
        });
      }
    }
  }
}
</script>

<style scoped>
</style>