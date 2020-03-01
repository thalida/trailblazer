<template>
  <div
    id="map"
    :style="{ width: `${max_scaled_size}px`, height: `${max_scaled_size}px` }"
  >
    <v-canvas
      v-for="feature in features"
      :key="feature.id"
      :size="max_scaled_size"
    >
      <v-map-feature :feature="feature" :scale="scale" />
    </v-canvas>
  </div>
</template>

<script>
import panzoom from 'panzoom'
import { mapState } from 'vuex'

import { IDS } from '@/game/map/settings.js'

import Canvas from '@/components/Canvas.vue'
import MapFeature from '@/components/MapFeature.vue'

export default {
  name: 'Map',
  components: {
    'v-canvas': Canvas,
    'v-map-feature': MapFeature,
  },
  data () {
    return {
      window: {
        width: null,
        height: null,
        largest_dimension: null,
      },
      scale: 2,
      panzoom: null,
      IDS,
    }
  },
  computed: {
    max_scaled_size () {
      return this.map_size * this.scale
    },
    ...mapState(['map_size', 'features', 'tiles',]),
  },
  created () {
    window.addEventListener('resize', this.onWindowResize)
  },
  mounted () {
    this.panzoom = panzoom(this.$el)
    this.setWindowDimensions()
    this.setPanzoomZoomLevels(true)
    this.panzoom.on('transform', this.onPanzoomTransform)
  },
  destroyed () {
    window.removeEventListener('resize', this.onWindowResize)
    this.$el.removeEventListener('wheel', this.panzoom.zoomWithWheel)
    this.$el.removeEventListener('panzoomchange', this.onPanzoomChange)
  },

  methods: {
    onWindowResize () {
      this.setWindowDimensions()
      this.setPanzoomZoomLevels()
      this.onPanzoomTransform()
    },
    setWindowDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      const largest_dimension = width > height ? width : height
      this.window = { width, height, largest_dimension, }
    },
    setPanzoomZoomLevels (center_panzoom) {
      const min_zoom = this.window.largest_dimension / this.max_scaled_size
      const max_zoom = 1
      const { scale, } = this.panzoom.getTransform()

      this.panzoom.setMinZoom(min_zoom)
      this.panzoom.setMaxZoom(max_zoom)

      if (scale < min_zoom) {
        this.panzoom.zoomTo(0, 0, min_zoom)
      }

      if (center_panzoom) {
        const middle_zoom = (max_zoom - min_zoom) / 2
        const zoomed_size = this.max_scaled_size * middle_zoom
        const center = -1 * Math.floor(zoomed_size / 2)
        this.panzoom.zoomTo(center, center, middle_zoom)
      }
    },
    onPanzoomTransform () {
      const { x, y, scale, } = this.panzoom.getTransform()
      const { width, height, } = this.window
      const scaled_size = this.max_scaled_size * scale
      const min_x = -1 * (scaled_size - width)
      const min_y = -1 * (scaled_size - height)
      const max_x = 0
      const max_y = 0
      const is_valid_x = min_x <= x && x <= max_x
      const is_valid_y = min_y <= y && y <= max_y
      if (is_valid_x && is_valid_y) {
        return
      }
      let new_x = x
      let new_y = y
      if (!is_valid_x) {
        new_x = x > max_x ? max_x : min_x
      }
      if (!is_valid_y) {
        new_y = y > max_y ? max_y : min_y
      }
      this.panzoom.moveTo(new_x, new_y)
    },
  },
}
</script>

<style lang="scss">
#map {
  position: relative;
  overflow: hidden;
  background: rgb(203, 236, 222);
  border: 4px solid red;
}
</style>
