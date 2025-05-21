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
        >
          <div v-for="(stream, userId) in remoteStreams" :key="userId" class="remote-video-container">
            <video
              :ref="el => { if (el) remoteVideoRefs[userId] = el as HTMLVideoElement }"
              autoplay
              playsinline
              class="remote-video"
            ></video>
            <div class="user-label">{{ getUsernameById(userId) }}</div>
          </div>
        </VideoGrid>
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
          :current-user="username"
          :typing-users="typingUsers"
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
import chatService from '@/services/chatService';
import userService from '@/services/userService';
import { useAuthStore } from '@/stores/auth'; // Import Pinia user store
import CallService from '@/services/CallService';

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
      users: [] as any[],
      onlineUsers: [] as any[],
      allUsers: [] as any[],
      messages: [] as any[],
      localStream: null as MediaStream | null,
      remoteStreams: {} as Record<string, MediaStream>,
      socket: null as WebSocket | null,
      isInCall: false,
      userId: '',
      username: '',
      // New state for sidebar toggles and sizes
      userListOpen: false,
      chatAreaOpen: false,
      isMobile: false,
      userListWidth: 320,
      chatAreaWidth: 380,
      resizing: null as string | null,
      minSidebarWidth: 250,
      maxSidebarWidth: 600,
      statusSocket: null as WebSocket | null,
      remoteVideoRefs: {} as Record<string, HTMLVideoElement>,
      callService: null as CallService | null,
      currentConversationId: '', // Added to track current conversation
      chatService: null,
      userService: null,
      typingUsers: [] as string[]
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
    window.addEventListener('resize', this.checkIfMobile);

    // Load saved sidebar widths from localStorage
    this.loadSavedSidebarWidths();
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

    window.removeEventListener('resize', this.checkIfMobile);

    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResizing);
  },
  methods: {
    // New methods for CallService integration
    handleRemoteStreamAdded(userId: string, stream: MediaStream) {
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

    handleRemoteStreamRemoved(userId: string) {
      console.log(`Remote stream removed for user ${userId}`);
      delete this.remoteStreams[userId];
      // Force reactivity update
      this.remoteStreams = { ...this.remoteStreams };
    },

    handleMessageReceived(message: any) {
      this.messages.push(message);
    },

    handleUserJoined(userId: string) {
      console.log(`User ${userId} joined the call`);
      // Update user status in the UI if needed
    },

    handleUserLeft(userId: string) {
      console.log(`User ${userId} left the call`);
      // Update user status in the UI if needed
    },

    handleUsersUpdated(users: any[]) {
      // Update online users from WebSocket
      this.onlineUsers = users || [];
      // Mark online status in allUsers
      this.updateUserStatus();
    },

    handleTypingStatusChanged(userId: string, isTyping: boolean, conversationId: string) {
      console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`);


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

    // Methods for sidebar resizing
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

    startResizing(sidebar: string, event: MouseEvent) {
      if (this.isMobile) return; // Disable resizing on mobile

      this.resizing = sidebar;
      event.preventDefault();
    },

    handleResize(event: MouseEvent) {
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
        const response = await userService.getUsers();
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
      } catch (error: any) {
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

    getUsernameById(userId: string) {
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

    handleTyping(isTyping: boolean) {
      if (this.callService) {
        this.callService.sendTypingStatus(isTyping);
      }
    },

    sendTypingStatus(isTyping: boolean, conversationId: string) {
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
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.video-grid {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #e0e0e0;
  overflow-y: auto;
}

.video-grid-item {
  width: 300px;
  height: 200px;
  margin: 10px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.video-grid-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-grid-item .username {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.sidebar {
  width: 320px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar.open {
  width: 320px;
}

.sidebar.closed {
  width: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.sidebar-header button {
  background-color: #007aff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.sidebar-content {
  padding: 10px;
}

.chat-area {
  width: 380px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.chat-area.open {
  width: 380px;
}

.chat-area.closed {
  width: 0;
}

.chat-area-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.chat-area-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.chat-area-header button {
  background-color: #007aff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.chat-area-content {
  padding: 10px;
}

.resizer {
  width: 5px;
  background-color: #e0e0e0;
  cursor: col-resize;
  user-select: none;
}

.resizer.active {
  background-color: #007aff;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .video-grid {
    flex-grow: 1;
    overflow-y: auto;
  }

  .sidebar,
  .chat-area {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }

  .sidebar.open,
  .chat-area.open {
    width: 100%;
  }

  .sidebar.closed,
  .chat-area.closed {
    width: 0;
    height: 0;
    display: none;
  }

  .resizer {
    display: none;
  }
}
</style>
<style scoped>
/* Add these styles to the bottom of your existing <style> section */
.cursor-ew-resize {
  cursor: ew-resize;
}
</style>