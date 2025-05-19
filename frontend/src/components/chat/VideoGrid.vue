<template>
  <div class="grid grid-cols-2 gap-4 h-full">
    <!-- Local video -->
    <div v-if="localStream" class="relative bg-black rounded overflow-hidden">
      <video
        ref="localVideo"
        class="w-full h-full object-cover"
        autoplay
        muted
        playsinline
      ></video>
      <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        You
      </div>
    </div>

    <!-- Remote videos -->
    <div
      v-for="(stream, userId) in remoteStreams"
      :key="userId"
      class="relative bg-black rounded overflow-hidden"
    >
      <video
        :ref="el => setVideoRef(el, userId)"
        class="w-full h-full object-cover"
        autoplay
        playsinline
      ></video>
      <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {{ getUsernameById(userId) }}
      </div>
    </div>

    <!-- Placeholder for empty slots -->
    <div
      v-for="i in getEmptySlots()"
      :key="`empty-${i}`"
      class="bg-gray-800 rounded flex items-center justify-center"
    >
      <div class="text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
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
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      videoRefs: {}
    }
  },
  watch: {
    localStream: {
      immediate: true,
      handler(stream) {
        this.$nextTick(() => {
          if (stream && this.$refs.localVideo) {
            this.$refs.localVideo.srcObject = stream;
          }
        });
      }
    },
    remoteStreams: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.updateVideoSources();
        });
      }
    }
  },
  methods: {
    setVideoRef(el, userId) {
      if (el) {
        this.videoRefs[userId] = el;
        this.updateVideoSources();
      }
    },
    updateVideoSources() {
      Object.entries(this.remoteStreams).forEach(([userId, stream]) => {
        const videoEl = this.videoRefs[userId];
        if (videoEl && videoEl.srcObject !== stream) {
          videoEl.srcObject = stream;
        }
      });
    },
    getEmptySlots() {
      // Calculate empty slots to maintain grid layout
      const totalSlots = 4; // 2x2 grid
      const usedSlots = (this.localStream ? 1 : 0) + Object.keys(this.remoteStreams).length;
      return Math.max(0, totalSlots - usedSlots);
    },
    getUsernameById(userId) {
      // This would ideally come from a parent component or store
      // For now, just show the user ID
      return `User ${userId.substring(0, 4)}`;
    }
  }
}
</script>