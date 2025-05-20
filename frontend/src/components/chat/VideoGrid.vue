<template>
  <div class="video-grid">
    <!-- No participants case - already handled in parent component -->

    <!-- Single participant case -->
    <div v-if="totalParticipants === 1" class="single-participant-view">
      <div v-if="localStream" class="video-wrapper">
        <video
          ref="localVideo"
          :srcObject.prop="localStream"
          autoplay
          muted
          playsinline
          class="video-element"
        ></video>
        <div class="participant-label">
          <span class="participant-name">You</span>
        </div>
      </div>
      <div v-else-if="Object.keys(validRemoteStreams).length === 1"
           v-for="(stream, userId) in validRemoteStreams"
           :key="userId"
           class="video-wrapper">
        <video
          :srcObject.prop="stream"
          autoplay
          playsinline
          class="video-element"
        ></video>
        <div class="participant-label">
          <span class="participant-name">{{ getUsernameById(userId) }}</span>
        </div>
      </div>
    </div>

    <!-- Multiple participants case -->
    <div v-else class="grid-layout" :class="gridClass">
      <!-- Local video -->
      <transition name="fade" appear>
        <div v-if="localStream" class="video-container">
          <video
            ref="localVideo"
            :srcObject.prop="localStream"
            autoplay
            muted
            playsinline
            class="video-element"
          ></video>
          <div class="participant-label">
            <div class="status-indicator local"></div>
            <span class="participant-name">You</span>
          </div>
        </div>
      </transition>

      <!-- Remote videos -->
      <transition-group name="fade" tag="div" class="remote-videos-container">
        <div
          v-for="(stream, userId) in validRemoteStreams"
          :key="userId"
          class="video-container"
        >
          <video
            :srcObject.prop="stream"
            autoplay
            playsinline
            class="video-element"
          ></video>
          <div class="participant-label">
            <div class="status-indicator remote"></div>
            <span class="participant-name">{{ getUsernameById(userId) }}</span>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoGrid',
  props: {
    localStream: {
      type: Object,
      default: null
    },
    remoteStreams: {
      type: Object,
      default: () => ({})
    },
    users: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
    totalParticipants() {
      // Count local stream (if exists) plus valid remote streams
      return (this.localStream ? 1 : 0) + Object.keys(this.validRemoteStreams).length;
    },
    gridClass() {
      // Determine grid layout based on number of participants
      const count = this.totalParticipants;
      if (count <= 1) return '';
      if (count === 2) return 'grid-cols-1';
      if (count <= 4) return 'grid-cols-2';
      if (count <= 9) return 'grid-cols-3';
      if (count <= 16) return 'grid-cols-4';
      return 'grid-cols-5'; // For 17+ participants
    },
    // Filter out remote streams that don't have valid users, but only for display purposes
    validRemoteStreams() {
      const result = {};

      if (!this.remoteStreams) {
        return result;
      }

      // Get the current user ID to filter out self-connections
      const currentUserId = this.users && this.users.length > 0
        ? this.users.find(u => u.isCurrentUser)?.id
        : null;

      Object.entries(this.remoteStreams).forEach(([userId, stream]) => {
        // Skip streams that are from the current user (self-connections)
        if (currentUserId && userId === currentUserId.toString()) {
          return;
        }

        // Include the stream if it's valid
        if (stream && stream.active) {
          result[userId] = stream;
        }
      });

      return result;
    }
  },
  methods: {
    getUsernameById(userId) {
      if (!userId) {
        return 'Unknown User';
      }

      if (!this.users || !Array.isArray(this.users) || this.users.length === 0) {
        return 'User';
      }

      // Convert userId to number for comparison if it's a string
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;

      // Handle NaN case if parsing failed
      if (isNaN(userIdNum)) {
        return 'User';
      }

      const user = this.users.find(u => u && u.id === userIdNum);
      return user && user.username ? user.username : 'User';
    }
  }
}
</script>

<style scoped>
.video-grid {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Prevent scrolling within the video grid */
  max-height: calc(100% - 60px); /* Reserve space for the end call button */
}

.single-participant-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.grid-layout {
  display: grid;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 12px;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Prevent grid overflow */
}

/* Adjust grid item sizes based on number of participants */
.grid-layout.grid-cols-1 {
  grid-template-columns: minmax(0, 1fr);
  grid-auto-rows: 100%;
}

.grid-layout.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: calc(50% - 6px);
}

.grid-layout.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: calc(33.333% - 8px);
}

.grid-layout.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: calc(25% - 9px);
}

.grid-layout.grid-cols-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-auto-rows: calc(20% - 9.6px);
}

.remote-videos-container {
  display: contents;
}

.video-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  background-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  aspect-ratio: 16/9;
  max-height: 100%; /* Ensure video containers don't exceed available height */
}

.video-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: filter 0.3s ease;
}

.participant-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.participant-name {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.local {
  background-color: #4ade80; /* Green for local user */
}

.status-indicator.remote {
  background-color: #60a5fa; /* Blue for remote users */
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .video-grid {
    max-height: calc(100% - 50px); /* Slightly less space reserved on smaller screens */
  }

  .grid-layout {
    gap: 8px;
    padding: 8px;
  }

  .participant-label {
    padding: 4px 8px;
    bottom: 8px;
    left: 8px;
  }

  .participant-name {
    font-size: 0.8rem;
    max-width: 120px;
  }
}

@media (max-width: 768px) {
  .grid-layout.grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: calc(33.333% - 5.333px);
  }

  .grid-layout.grid-cols-4, .grid-layout.grid-cols-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: calc(25% - 6px);
  }
}

@media (max-width: 480px) {
  .grid-layout {
    grid-template-columns: 1fr !important;
    gap: 6px;
    padding: 6px;
  }

  .grid-layout.grid-cols-2,
  .grid-layout.grid-cols-3,
  .grid-layout.grid-cols-4,
  .grid-layout.grid-cols-5 {
    grid-auto-rows: calc(33.333% - 4px);
  }

  .participant-label {
    bottom: 6px;
    left: 6px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .video-container {
    background-color: #121212;
  }
}
</style>