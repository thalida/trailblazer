<template>
  <t-Canvas>
    <Map v-once />
  </t-Canvas>
</template>

<script>
import Canvas from '@/components/Canvas.vue'
import Map from '@/components/Map.vue'

export default {
  name: 'Game',
  components: {
    't-Canvas': Canvas,
    Map,
  },
}
</script>
