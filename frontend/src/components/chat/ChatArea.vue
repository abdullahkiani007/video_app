<template>
  <div class="flex flex-col h-full overflow-hidden bg-gray-900">
    <!-- Chat header -->
    <div class="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center shadow-sm">
      <h3 class="font-medium text-white">Chat</h3>
      <div class="ml-auto text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
        {{ messages.length }} messages
      </div>
    </div>

    <!-- Messages area with explicit height constraints -->
    <div
      class="flex-grow overflow-y-auto p-4 bg-gray-900"
      ref="messagesContainer"
      style="height: calc(100% - 70px);"
    >
      <div v-if="!messages || messages.length === 0" class="flex items-center justify-center h-full">
        <div class="text-gray-400 italic text-center p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          No messages yet. Start the conversation!
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="mb-4 max-w-[85%] transition-all duration-200"
        :class="[
          message.sender_username === currentUser ? 'ml-auto' : 'mr-auto'
        ]"
      >
        <div class="flex flex-col">
          <div class="text-xs text-gray-400 mb-1 font-medium"
               :class="[message.sender_username === currentUser ? 'text-right' : 'text-left']">
            {{ message.sender_username || 'User' }}
          </div>
          <div
            class="p-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            :class="[
              message.sender_username === currentUser ?
              'bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none' :
              'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
            ]"
          >
            <div class="text-sm break-words">{{ message.content || '' }}</div>
          </div>
          <div class="text-xs text-gray-400 mt-1"
               :class="[message.sender_username === currentUser ? 'text-right' : 'text-left']">
            {{ formatTime(message.created_at) }}
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div
        v-if="typingUsers && typingUsers.length > 0"
        class="text-xs bg-gray-800 text-gray-300 italic mt-2 ml-2 px-3 py-2 rounded-full inline-block shadow-sm border border-gray-700"
      >
        <div class="flex items-center">
          <div class="typing-dots mr-2">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {{ formatTypingMessage(typingUsers) }}
        </div>
      </div>
    </div>

    <!-- Message input with fixed height -->
    <div class="border-t border-gray-700 p-3 bg-gray-800 shadow-inner" style="height: 70px;">
      <form @submit.prevent="sendMessage" class="flex h-full">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 border border-gray-600 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-700 text-white placeholder-gray-400"
          maxlength="1000"
          @keydown.enter="sendMessage"
        />
        <button
          type="submit"
          class="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
          :disabled="!newMessage.trim()"
        >
          <span>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatArea',
  props: {
    messages: {
      type: Array,
      required: true,
      default: () => []
    },
    currentUser: {
      type: String,
      default: ''
    },
    // Add new props for typing indicators
    typingUsers: {
      type: Array,
      default: () => []
    },
    // Support both currentUser and currentUserId for flexibility
    currentUserId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      newMessage: '',
      typingTimeout: null
    }
  },
  computed: {
    // Use either currentUser or currentUserId based on what's provided
    effectiveCurrentUser() {
      return this.currentUser || this.currentUserId || '';
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    },
    newMessage(val) {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      if (val.trim().length > 0) {
        this.$emit('typing', true);

        this.typingTimeout = setTimeout(() => {
          this.$emit('typing', false);
        }, 2000);
      } else {
        this.$emit('typing', false);
      }
    }
  },
  mounted() {
    this.scrollToBottom();
    // Add resize event listener to handle layout changes
    window.addEventListener('resize', this.scrollToBottom);

    // Force scroll to bottom on initial render
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },
  beforeUnmount() {
    // Clean up event listener
    window.removeEventListener('resize', this.scrollToBottom);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.$emit('typing', false);
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;

      try {
        this.$emit('send-message', this.newMessage.trim());
        this.newMessage = '';
        // Scroll to bottom after sending
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    scrollToBottom() {
      try {
        const container = this.$refs.messagesContainer;
        if (container) {
          // Force scroll to bottom
          container.scrollTop = container.scrollHeight + 1000;

          // Double-check with a slight delay to ensure it worked
          setTimeout(() => {
            container.scrollTop = container.scrollHeight + 1000;
          }, 50);
        }
      } catch (error) {
        console.error('Error scrolling to bottom:', error);
      }
    },
    formatTime(timestamp) {
      try {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
      }
    },
    formatTypingMessage(users) {
      if (!users || !Array.isArray(users)) {
        return '';
      }

      try {
        // Filter out current user if present
        const filteredUsers = users.filter(user => user !== this.effectiveCurrentUser);

        if (filteredUsers.length === 0) {
          return '';
        } else if (filteredUsers.length === 1) {
          return `${filteredUsers[0]} is typing...`;
        } else if (filteredUsers.length === 2) {
          return `${filteredUsers[0]} and ${filteredUsers[1]} are typing...`;
        } else if (filteredUsers.length === 3) {
          return `${filteredUsers[0]}, ${filteredUsers[1]}, and ${filteredUsers[2]} are typing...`;
        } else if (filteredUsers.length < 10) {
          // For moderate number of users (4-9), show count
          return `${filteredUsers.length} people are typing...`;
        } else {
          // For large number of users (10+), show "Many people"
          return `Many people are typing...`;
        }
      } catch (error) {
        console.error('Error formatting typing message:', error);
        return 'Activity in chat...';
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
  height: 6px;
  width: 6px;
  margin: 0 1px;
  background-color: #9CA3AF;
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
</style>