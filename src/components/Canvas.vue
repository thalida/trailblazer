<template>
  <div class="canvas">
    <canvas
      ref="canvas"
      :width="size"
      :height="size"
      :style="{ width: `${size}px`, height: `${size}px` }"
    ></canvas>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['size',],

  data () {
    return {
      canvas: {
        context: null,
      },
    }
  },

  provide () {
    return { canvas: this.canvas, }
  },

  mounted () {
    let $canvas = this.$refs['canvas']
    this.canvas.context = $canvas.getContext('2d')
  },
}
</script>

<style lang="scss">
.canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
