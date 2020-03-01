<template>
  <div id="map" :style="{ width: `${map_size}px`, height: `${map_size}px` }">
    <v-canvas v-for="feature in features" :key="feature.id" :size="map_size">
      <v-map-feature :feature="feature" />
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
      },
      min_zoom: null,
      panzoom: null,
      IDS,
    }
  },
  computed: {
    ...mapState(['map_size', 'features', 'tiles',]),
  },
  created () {
    window.addEventListener('resize', this.onWindowResize)
  },
  mounted () {
    const center = -1 * Math.floor(this.map_size / 2)
    this.panzoom = panzoom(this.$el)
    this.setWindowDimensions()
    this.setPanzoomZoomLevels()
    this.panzoom.moveTo(center, center)
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
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      const height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
      const largest_dimension = width > height ? width : height
      const size_diff = this.map_size - largest_dimension

      this.window = { width, height, }
      this.min_zoom = 1 - size_diff / this.map_size
    },
    setPanzoomZoomLevels () {
      const { scale, } = this.panzoom.getTransform()
      if (this.min_zoom > scale) {
        this.panzoom.zoomTo(this.min_zoom)
      }
      this.panzoom.setMinZoom(this.min_zoom)
      this.panzoom.setMaxZoom(1.5)
    },
    onPanzoomTransform () {
      const { x, y, scale, } = this.panzoom.getTransform()
      const { width, height, } = this.window
      const scaled_size = this.map_size * scale
      const min_y = -1 * (scaled_size - height)
      const max_y = 0
      const min_x = -1 * (scaled_size - width)
      const max_x = 0
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
}
</style>
