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
export default {
  data () {
    // const largest_screen_side =
    //   window.screen.height > window.screen.width
    //     ? window.screen.height
    //     : window.screen.width
    const pixelRatio = window.devicePixelRatio
    const size = 4000
    return {
      canvas: {
        context: null,
        pixelRatio,
        size,
      },
    }
  },

  provide () {
    return { canvas: this.canvas, }
  },

  mounted () {
    this.canvas.context = this.$refs['canvas'].getContext('2d')
  },
}
</script>
