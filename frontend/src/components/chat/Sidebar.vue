<template>
  <div
    class="fixed top-0 left-0 h-full bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40 shadow-lg flex flex-col backdrop-blur-sm border-r border-gray-800"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    :style="isOpen ? { width: isMobile ? '100%' : `${width}px` } : {}"
  >
    <!-- Futuristic grid background -->
    <div class="absolute inset-0 z-0 opacity-5">
      <div class="grid-bg"></div>
    </div>
    <!-- Subtle glowing orbs -->
    <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-500 opacity-5 blur-[100px]"></div>
    <div class="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-purple-500 opacity-5 blur-[100px]"></div>

    <!-- Sidebar header with user profile -->
    <div class="p-4 border-b border-gray-800 flex items-center justify-between relative z-10">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center text-xl font-bold mr-3 relative group overflow-hidden">
          <!-- Glowing effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="relative z-10">{{ username ? username.charAt(0).toUpperCase() : 'U' }}</span>
        </div>
        <div>
          <h3 class="font-bold text-white">{{ username }}</h3>
          <p class="text-sm text-cyan-400">Online</p>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Logout button -->
    <div class="px-4 py-2 border-b border-gray-800 relative z-10">
      <button
        @click="handleLogout"
        class="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-sm group relative overflow-hidden"
      >
        <span class="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="font-medium relative z-10">Sign Out</span>
      </button>
    </div>

    <!-- Sidebar tabs -->
    <div class="flex border-b border-gray-800 relative z-10">
      <button
        @click="activeTab = 'users'"
        class="flex-1 py-3 text-center font-medium transition-colors"
        :class="activeTab === 'users' ? 'text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200'"
      >
        Users
      </button>
      <button
        @click="activeTab = 'chat'"
        class="flex-1 py-3 text-center font-medium transition-colors"
        :class="activeTab === 'chat' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'"
      >
        Chat
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Users tab -->
      <div v-if="activeTab === 'users'" class="h-full overflow-y-auto p-4 relative z-10">
        <h2 class="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Online Users</h2>
        <UserList :users="users" :initial-width="width - 32" />
      </div>

      <!-- Chat tab -->
      <div v-if="activeTab === 'chat'" class="h-full flex flex-col relative z-10">
        <ChatArea
          :messages="messages"
          :current-user="username"
          :typing-users="typingUsers"
          @send-message="$emit('send-message', $event)"
          @typing="$emit('typing', $event)"
          class="flex-1 overflow-y-auto"
        />
      </div>

      <!-- Resize handle -->
      <div
        v-if="!isMobile"
        class="absolute top-0 right-0 w-4 h-full cursor-ew-resize z-20"
        @mousedown="startResize"
      >
        <div class="w-1 h-full bg-gradient-to-b from-cyan-600 to-purple-600 hover:opacity-100 opacity-50 mx-auto transition-opacity"></div>
      </div>
    </div>
  </div>
</template>

<script>
import UserList from '@/components/chat/UserList.vue';
import ChatArea from '@/components/chat/ChatArea.vue';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Sidebar',
  components: {
    UserList,
    ChatArea
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 320
    },
    username: {
      type: String,
      required: true
    },
    users: {
      type: Array,
      default: () => []
    },
    messages: {
      type: Array,
      default: () => []
    },
    typingUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'users',
      isMobile: false,
      authStore: useAuthStore(),
      isResizing: false
    }
  },
  methods: {
    handleLogout() {
      // Confirm before logging out to prevent accidental clicks
      this.authStore.logout();
      this.$router.push('/login');
      this.$emit('logout');
    },
    checkMobile() {
      // Consider devices with width less than 768px as mobile
      this.isMobile = window.innerWidth < 768;
    },
    startResize(event) {
      // Only allow resizing on non-mobile devices
      if (this.isMobile) return;

      this.isResizing = true;

      // Store initial mouse position and sidebar width
      const initialX = event.clientX;
      const initialWidth = this.width;

      // Define the mousemove handler
      const handleMouseMove = (e) => {
        if (!this.isResizing) return;

        // Calculate new width based on mouse movement
        const newWidth = initialWidth + (e.clientX - initialX);

        // Enforce min and max width constraints
        const constrainedWidth = Math.max(280, Math.min(newWidth, 500));

        // Emit the resize event with the new width
        this.$emit('resize', constrainedWidth);
      };

      // Define the mouseup handler
      const handleMouseUp = () => {
        this.isResizing = false;

        // Remove event listeners when done resizing
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      // Add event listeners for mousemove and mouseup
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  },
  mounted() {
    // Check if mobile on initial load
    this.checkMobile();

    // Add event listener to update on window resize
    window.addEventListener('resize', this.checkMobile);
  },
  beforeDestroy() {
    // Clean up event listener when component is destroyed
    window.removeEventListener('resize', this.checkMobile);
  }
}
</script>

<style scoped>
/* Futuristic grid background */
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  width: 100%;
  height: 100%;
}

/* Ensure scrolling works properly */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937; /* dark gray to match theme */
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563; /* medium gray */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* lighter gray on hover */
}

/* Pulse animation for elements */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
  }
}

/* Floating animation for icons */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Cursor styles for resizing */
.cursor-ew-resize {
  cursor: ew-resize;
}

/* Hide resize handle on mobile */
@media (max-width: 767px) {
  .cursor-ew-resize {
    display: none;
  }
}
</style>