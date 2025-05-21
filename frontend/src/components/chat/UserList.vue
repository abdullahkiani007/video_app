<template>
  <div class="flex flex-col h-full bg-gray-950 relative">
    <!-- Futuristic grid background -->
    <div class="absolute inset-0 z-0 opacity-5">
      <div class="grid-bg"></div>
    </div>
    <!-- Subtle glowing orbs -->
    <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-500 opacity-5 blur-[100px]"></div>
    <div class="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-purple-500 opacity-5 blur-[100px]"></div>

    <!-- Header -->
    <div class="px-4 py-3 bg-gray-900/90 border-b border-gray-800 flex items-center shadow-sm backdrop-blur-sm relative z-10">
      <h3 class="font-medium text-white">Participants</h3>
      <div class="ml-auto text-xs text-gray-300 bg-gray-800/80 px-2 py-1 rounded-full">
        {{ onlineCount }} online
      </div>
    </div>

    <!-- User list -->
    <div class="flex-1 overflow-y-auto p-2 bg-gray-900/50 backdrop-blur-sm relative z-10">
      <div v-if="!users || users.length === 0" class="flex items-center justify-center h-full">
        <div class="text-gray-400 italic text-center p-4 bg-gray-800/80 rounded-lg shadow-sm border border-gray-700">
          No users online
        </div>
      </div>

      <div v-else>
        <!-- Current user (you) -->
        <div v-if="currentUser" class="mb-4 p-2">
          <div class="text-xs uppercase text-gray-400 font-semibold mb-2 px-2">You</div>
          <div class="flex items-center p-2 rounded-lg bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-gray-800 backdrop-blur-sm group hover:border-gray-700 transition-all duration-300">
            <!-- User avatar -->
            <div class="relative">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center text-white font-medium overflow-hidden">
                {{ getInitials(currentUser) }}
              </div>
              <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
            </div>

            <!-- User info -->
            <div class="ml-3 flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                  {{ currentUser }}
                </p>
                <span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  You
                </span>
              </div>
              <p class="text-xs text-gray-400 truncate">Online</p>
            </div>
          </div>
        </div>

        <!-- Other users -->
        <div v-if="otherUsers.length > 0" class="p-2">
          <div class="text-xs uppercase text-gray-400 font-semibold mb-2 px-2">Other Users</div>
          <div
            v-for="(user, index) in otherUsers"
            :key="index"
            class="flex items-center p-2 rounded-lg mb-2 bg-gray-800/60 border border-gray-800 hover:border-gray-700 group transition-all duration-300"
          >
            <!-- User avatar -->
            <div class="relative">
              <div class="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium overflow-hidden">
                {{ getInitials(user.username || user.name || 'User') }}
              </div>
              <div
                class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900"
                :class="user.is_online ? 'bg-green-500' : 'bg-gray-500'"
              ></div>
            </div>

            <!-- User info -->
            <div class="ml-3 flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                  {{ user.username || user.name || 'User' }}
                </p>
                <span v-if="user.is_typing" class="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex items-center">
                  <span class="typing-dots mr-1">
                    <span class="bg-cyan-400"></span>
                    <span class="bg-purple-400"></span>
                    <span class="bg-cyan-400"></span>
                  </span>
                  typing
                </span>
              </div>
              <p class="text-xs text-gray-400 truncate">
                {{ user.is_online ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  props: {
    users: {
      type: Array,
      required: true,
      default: () => []
    },
    currentUserId: {
      type: String,
      default: ''
    },
    onlineUsers: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    // Calculate the actual number of online users
    onlineCount() {
      // Safely handle edge cases
      if (!this.onlineUsers || !Array.isArray(this.onlineUsers) || !this.users) {
        return 0;
      }

      // Count only users that exist in both the users array and onlineUsers array
      const onlineUserIds = this.onlineUsers.map(id => String(id));
      const validOnlineUsers = this.users.filter(user =>
        onlineUserIds.includes(String(user.id)) ||
        onlineUserIds.includes(String(user.userId))
      );

      return validOnlineUsers.length;
    },

    // Find current user from the users array
    currentUser() {
      if (!this.users || !this.currentUserId) return null;

      const currentUserObj = this.users.find(user =>
        user.id === this.currentUserId ||
        user.userId === this.currentUserId
      );

      return currentUserObj ? (currentUserObj.username || currentUserObj.name) : null;
    },

    // Filter out current user from the users array and sort by online status
    otherUsers() {
      if (!this.users) return [];

      return this.users.filter(user =>
        user.id !== this.currentUserId &&
        user.userId !== this.currentUserId
      ).map(user => {
        // Check if user is online by comparing their string ID with onlineUsers array
        // Convert user.id and user.userId to strings before comparison
        const isOnline = this.onlineUsers.includes(String(user.id)) || this.onlineUsers.includes(String(user.userId));

        return {
          ...user,
          is_online: isOnline
        };
      }).sort((a, b) => {
        // Sort by online status (online users first)
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;

        // If both have the same online status, sort alphabetically by username/name
        const nameA = (a.username || a.name || '').toLowerCase();
        const nameB = (b.username || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
  },
  methods: {
    // Get initials from name
    getInitials(name) {
      try {
        if (!name) return '?';

        // Handle single word names
        if (!name.includes(' ')) {
          return name.charAt(0).toUpperCase();
        }

        // Get first letter of first and last name
        const parts = name.split(' ');
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      } catch (error) {
        console.error('Error getting initials:', error);
        return '?';
      }
    }
  }
}
</script>

<style scoped>
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

/* Typing indicator animation */
.typing-dots {
  display: inline-flex;
  align-items: center;
}

.typing-dots span {
  height: 4px;
  width: 4px;
  margin: 0 1px;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.7;
}

.typing-dots span:nth-child(1) {
  animation: pulse 1s infinite 0.1s;
}

.typing-dots span:nth-child(2) {
  animation: pulse 1s infinite 0.3s;
}

.typing-dots span:nth-child(3) {
  animation: pulse 1s infinite 0.5s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Futuristic grid background */
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  width: 100%;
  height: 100%;
}

/* Floating animation for elements */
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
</style>