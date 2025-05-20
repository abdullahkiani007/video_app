<template>
  <div class="video-grid" :class="gridClass">
    <!-- Debug info (remove in production) -->
    <div v-if="false" class="debug-info">
      Total participants: {{ totalParticipants }}<br>
      Remote streams: {{ Object.keys(validRemoteStreams).join(', ') }}
    </div>

    <!-- Empty state - no participants -->
    <div v-if="totalParticipants === 0" class="empty-state">
      <p>No participants in the call</p>
    </div>

    <!-- Two-person call layout (1 local + 1 remote) -->
    <div v-else-if="totalParticipants === 2 && localStream && Object.keys(validRemoteStreams).length === 1"
         class="two-person-grid">
      <!-- Local video -->
      <div class="video-container relative local-video">
        <video
          ref="localVideo"
          :srcObject.prop="localStream"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover rounded-lg"
        ></video>
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          You
        </div>
      </div>

      <!-- Remote video (single participant) -->
      <div
        v-for="(stream, userId) in validRemoteStreams"
        :key="userId"
        class="video-container relative remote-video"
      >
        <video
          :ref="el => { if (el) remoteVideoRefs[userId] = el }"
          autoplay
          playsinline
          class="w-full h-full object-cover rounded-lg"
        ></video>
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          {{ getUsernameById(userId) }}
        </div>
      </div>
    </div>

    <!-- Standard grid layout for other cases -->
    <template v-else>
      <!-- Local video -->
      <div v-if="localStream" class="video-container relative">
        <video
          ref="localVideo"
          :srcObject.prop="localStream"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover rounded-lg"
        ></video>
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          You
        </div>
      </div>

      <!-- Remote videos -->
      <div
        v-for="(stream, userId) in validRemoteStreams"
        :key="userId"
        class="video-container relative"
      >
        <video
          :ref="el => { if (el) remoteVideoRefs[userId] = el }"
          autoplay
          playsinline
          class="w-full h-full object-cover rounded-lg"
        ></video>
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          {{ getUsernameById(userId) }}
        </div>
      </div>
    </template>
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
    },
    currentUserId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      remoteVideoRefs: {}
    };
  },
  data() {
    return {
      remoteVideoRefs: {}
    };
  },
  computed: {
    totalParticipants() {
      console.log("users ", this.users);
      console.log("local stream ", this.localStream);
      console.log("remote streams ", this.remoteStreams);

      // Count local stream (if exists) plus valid remote streams
      return (this.localStream ? 1 : 0) + Object.keys(this.validRemoteStreams).length;
    },
    gridClass() {
      // Determine grid layout based on number of participants
      const count = this.totalParticipants;

      // Special case for two-person calls
      if (count === 2 && this.localStream && Object.keys(this.validRemoteStreams).length === 1) {
        return 'two-person-layout';
      }

      if (count <= 1) return '';
      if (count <= 4) return 'grid-cols-2';
      if (count <= 9) return 'grid-cols-3';
      return 'grid-cols-4';
    },
    validRemoteStreams() {
      const result = {};

      if (!this.remoteStreams) {
        return result;
      }

      // Debug the remote streams
      Object.entries(this.remoteStreams).forEach(([userId, stream]) => {
        console.log(`stream`, stream);

        // Include the stream if it's valid
        if (stream && stream.active) {
          result[userId] = stream;
        }
      });

      return result;
    }
  },
  watch: {
    localStream(newStream) {
      this.$nextTick(() => {
        if (newStream && this.$refs.localVideo) {
          console.log('Setting local video stream');
          this.$refs.localVideo.srcObject = newStream;
        }
      });
    },

    remoteStreams: {
      handler(newStreams) {
        this.$nextTick(() => {
          console.log('Updating remote video streams');
          Object.entries(newStreams).forEach(([userId, stream]) => {
            const refName = `remoteVideo_${userId}`;
            if (this.$refs[refName] && this.$refs[refName][0]) {
              console.log(`Setting stream for remote user ${userId}`);
              this.$refs[refName][0].srcObject = stream;
            } else {
              console.warn(`Video element for user ${userId} not found`);
            }
          });
        });
      },
      deep: true
    },
    validRemoteStreams: {
      handler() {
        this.$nextTick(() => {
          // Ensure all videos are playing
          Object.entries(this.remoteVideoRefs).forEach(([userId, videoEl]) => {
            if (videoEl && videoEl.paused && this.validRemoteStreams[userId]) {
              videoEl.play().catch(err => {
                console.warn(`Failed to play video for user ${userId}:`, err);
              });
            }
          });
        });
      },
      deep: true
    }
  },
  mounted() {
    // Set initial streams
    if (this.localStream && this.$refs.localVideo) {
      this.$refs.localVideo.srcObject = this.localStream;
    }

    this.$nextTick(() => {
      Object.entries(this.remoteStreams).forEach(([userId, stream]) => {
        const refName = `remoteVideo_${userId}`;
        if (this.$refs[refName] && this.$refs[refName][0]) {
          this.$refs[refName][0].srcObject = stream;
        }
      });
    });

    // Ensure local video is playing
    this.$nextTick(() => {
      const localVideo = this.$refs.localVideo;
      if (localVideo && this.localStream) {
        localVideo.play().catch(err => {
          console.warn('Failed to play local video:', err);
        });
      }
    });
  },
  methods: {
    getUsernameById(userId) {
      if (!userId || !this.users || !Array.isArray(this.users)) {
        return `User ${userId}`;
      }

      // Try to find the user by ID
      const user = this.users.find(u =>
        u && (u.id === parseInt(userId) || u.userId === parseInt(userId))
      );

      return user ? user.username : `User ${userId}`;
    },

    // Method to force refresh video elements
    refreshVideoElements() {
      this.$nextTick(() => {
        // Refresh local video
        if (this.localStream && this.$refs.localVideo) {
          const localVideo = this.$refs.localVideo;
          if (Array.isArray(localVideo)) {
            localVideo[0].srcObject = this.localStream;
          } else {
            localVideo.srcObject = this.localStream;
          }
        }

        // Refresh remote videos
        Object.entries(this.validRemoteStreams).forEach(([userId, stream]) => {
          const videoEl = this.remoteVideoRefs[userId];
          if (videoEl && videoEl.srcObject !== stream) {
            console.log(`Refreshing video for user ${userId}`);
            videoEl.srcObject = stream;
            videoEl.play().catch(err => {
              console.warn(`Could not play remote video for ${userId}:`, err);
            });
          }
        });
      });
    }
  },
  watch: {
    // Watch for changes in remote streams and update video elements
    validRemoteStreams: {
      handler(newStreams) {
        this.$nextTick(() => {
          Object.entries(newStreams).forEach(([userId, stream]) => {
            const videoEl = this.remoteVideoRefs[userId];
            if (videoEl && videoEl.srcObject !== stream) {
              console.log(`Setting srcObject for remote video ${userId}`);
              videoEl.srcObject = stream;
              videoEl.play().catch(err => {
                console.warn(`Could not play remote video for ${userId}:`, err);
              });
            }
          });
        });
      },
      deep: true,
      immediate: true
    },

    // Watch for changes in total participants to handle layout changes
    totalParticipants: {
      handler() {
        this.refreshVideoElements();
      }
    }
  },
  mounted() {
    // Initial setup of video elements
    this.refreshVideoElements();
  },
  updated() {
    // Refresh video elements after DOM updates
    this.refreshVideoElements();
  }
};
</script>

<style scoped>
.video-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  height: 100%;
  width: 100%;
}

.video-container {
  aspect-ratio: 16/9;
  background-color: #1a1a1a;
  border-radius: 0.5rem;
  overflow: hidden;
}

.two-person-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* For mobile, stack the videos in two-person layout */
@media (max-width: 768px) {
  .two-person-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 1.2rem;
}

.debug-info {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px;
  font-size: 12px;
  z-index: 100;
}
</style>