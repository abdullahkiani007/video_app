<template>
  <div class="grid gap-4 w-full h-full" :class="gridClass">
    <!-- Debug info (remove in production) -->
    <div v-if="false" class="absolute top-0 left-0 bg-black/70 text-white p-1 text-xs z-50">
      Total participants: {{ totalParticipants }}<br>
      Remote streams: {{ Object.keys(validRemoteStreams).join(', ') }}
    </div>

    <!-- Empty state - no participants -->
    <div v-if="totalParticipants === 0" class="flex justify-center items-center h-full text-gray-400 text-lg">
      <div class="text-center p-8 bg-gray-800/30 rounded-xl max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p class="text-xl font-medium">No participants in the call</p>
        <p class="mt-2 text-gray-500">Waiting for others to join...</p>
      </div>
    </div>

    <!-- Single participant (just local stream) -->
    <div v-else-if="totalParticipants === 1 && localStream && Object.keys(validRemoteStreams).length === 0"
         class="flex justify-center items-center h-full">
      <div class="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg max-w-2xl w-full mx-auto aspect-video">
        <video
          ref="localVideo"
          :srcObject.prop="localStream"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
        ></video>
        <div class="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          You
        </div>
      </div>
    </div>

    <!-- Two-person call layout (1 local + 1 remote) -->
    <div v-else-if="totalParticipants === 2 && localStream && Object.keys(validRemoteStreams).length === 1"
         class="absolute inset-0 flex flex-col md:flex-row justify-center items-center gap-2 md:p-4">
      <!-- Local video -->
      <div class="relative bg-gray-800 w-full h-[calc(100vh-10rem)] ">
        <video
          ref="localVideo"
          :srcObject.prop="localStream"
          autoplay
          playsinline
          muted
          class="absolute inset-0 w-full h-full object-contain md:object-cover"
        ></video>
        <div class="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          You
        </div>
      </div>

      <!-- Remote video (single participant) -->
      <div
        v-for="(stream, userId) in validRemoteStreams"
        :key="userId"
        class="relative bg-gray-800 w-full h-[calc(100vh-10rem)] "
      >
        <video
          :ref="el => { if (el) remoteVideoRefs[userId] = el }"
          autoplay
          playsinline
          class="absolute inset-0 w-full h-full object-contain md:object-cover"
        ></video>
        <div class="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ getUsernameById(userId) }}
        </div>
      </div>
    </div>

    <!-- Standard grid layout for other cases -->
    <template v-else>
      <!-- Local video -->
      <div v-if="localStream" class="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg h-auto">
        <div class="aspect-video">
          <video
            ref="localVideo"
            :srcObject.prop="localStream"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
          ></video>
        </div>
        <div class="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          You
        </div>
      </div>

      <!-- Remote videos -->
      <div
        v-for="(stream, userId) in validRemoteStreams"
        :key="userId"
        class="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg h-auto"
      >
        <div class="aspect-video">
          <video
            :ref="el => { if (el) remoteVideoRefs[userId] = el }"
            autoplay
            playsinline
            class="w-full h-full object-cover"
          ></video>
        </div>
        <div class="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
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
  computed: {
    totalParticipants() {
      // Count local stream (if exists) plus valid remote streams
      return (this.localStream ? 1 : 0) + Object.keys(this.validRemoteStreams).length;
    },
    gridClass() {
      // Determine grid layout based on number of participants
      const count = this.totalParticipants;

      // Base classes that should always be applied
      let classes = 'p-4 md:p-6';

      // Special case for empty state
      if (count <= 0) {
        return classes;
      }

      // Special case for single participant
      if (count === 1) {
        return `${classes} flex justify-center items-center`;
      }

      // Special case for two-person calls - handled separately in template
      if (count === 2) {
        return `${classes} grid-cols-2 gap-4`;
      }

      // For 3 participants, use a specific layout
      if (count === 3) {
        return `${classes} grid-cols-2 gap-4 md:gap-6 auto-rows-auto`;
      }

      // For more participants
      if (count <= 4) return `${classes} grid-cols-2 gap-4 md:gap-6 auto-rows-auto`;
      if (count <= 9) return `${classes} grid-cols-3 gap-3 md:gap-4 auto-rows-auto`;
      return `${classes} grid-cols-4 gap-2 auto-rows-auto`;
    },
    validRemoteStreams() {
      const result = {};

      if (!this.remoteStreams) {
        return result;
      }

      // Filter for valid streams only
      Object.entries(this.remoteStreams).forEach(([userId, stream]) => {
        // Include the stream if it's valid
        if (stream && stream.active) {
          result[userId] = stream;
        }
      });

      return result;
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

              // Defensive play - handle potential errors
              if (videoEl.paused) {
                videoEl.play().catch(err => {
                  console.warn(`Could not play remote video for ${userId}:`, err);
                });
              }
            }
          });
        });
      },
      deep: true,
      immediate: true
    },

    // Watch for changes in local stream
    localStream(newStream) {
      this.$nextTick(() => {
        if (newStream && this.$refs.localVideo) {
          const localVideo = this.$refs.localVideo;
          if (Array.isArray(localVideo)) {
            localVideo[0].srcObject = newStream;
          } else {
            localVideo.srcObject = newStream;
          }
        }
      });
    },

    // Watch for changes in total participants to handle layout changes
    totalParticipants: {
      handler() {
        this.refreshVideoElements();
      }
    }
  },
  methods: {
    getUsernameById(userId) {
      if (!userId || !this.users || !Array.isArray(this.users)) {
        return `User ${userId}`;
      }

      // Try to find the user by ID - handle both string and number IDs
      const user = this.users.find(u => {
        if (!u) return false;
        const uId = u.id !== undefined ? u.id : u.userId;
        return uId === parseInt(userId) || uId === userId;
      });

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

          // Defensive play - handle potential errors
          if (localVideo.paused) {
            localVideo.play().catch(err => {
              console.warn('Failed to play local video:', err);
            });
          }
        }

        // Refresh remote videos
        Object.entries(this.validRemoteStreams).forEach(([userId, stream]) => {
          const videoEl = this.remoteVideoRefs[userId];
          if (videoEl && videoEl.srcObject !== stream) {
            videoEl.srcObject = stream;

            // Defensive play - handle potential errors
            if (videoEl.paused) {
              videoEl.play().catch(err => {
                console.warn(`Could not play remote video for ${userId}:`, err);
              });
            }
          }
        });
      });
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
