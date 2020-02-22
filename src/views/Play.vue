<template>
  <div>
    <v-canvas>
      <v-canvas-map />
    </v-canvas>
  </div>
</template>

<script>
import Canvas from '@/components/canvas/Canvas.vue'
import CanvasMap from '@/components/canvas/partials/Map.vue'

export default {
  name: 'Play',
  components: {
    'v-canvas': Canvas,
    'v-canvas-map': CanvasMap,
  },
}
</script>
