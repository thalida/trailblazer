<template>
  <div class="canvas">
    <canvas
      ref="canvas"
      :width="canvas.size"
      :height="canvas.size"
      :style="{ width: `${canvas.size}px`, height: `${canvas.size}px` }"
    ></canvas>
    <slot></slot>
  </div>
</template>

<script>
import panzoom from 'panzoom'
import { settings } from '@/game.js'
export default {
  data () {
    const size = settings.tile_size * settings.grid_size
    return {
      panzoom: null,
      canvas: {
        context: null,
        size,
      },
    }
  },

  provide () {
    return { canvas: this.canvas, }
  },

  mounted () {
    let $canvas = this.$refs['canvas']
    this.canvas.context = $canvas.getContext('2d')
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    const largest_side = width > height ? width : height
    const size_diff = this.canvas.size - largest_side
    const size_ratio = 1 - size_diff / this.canvas.size
    this.panzoom = panzoom($canvas, {
      maxZoom: 1.5,
      minZoom: size_ratio,
    })
    this.panzoom.moveTo(
      -1 * Math.floor(this.canvas.size / 2),
      -1 * Math.floor(this.canvas.size / 2)
    )
    this.panzoom.on('transform', pz => {
      const { x, y, scale, } = pz.getTransform()
      const scaled_size = this.canvas.size * scale
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      const height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight

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

      pz.moveTo(new_x, new_y)
    })
  },
}
</script>
