<template>
  <div class="play">
    <v-map v-if="rendered" :size="MAP_SIZE" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { TILE_SIZE, GRID_SIZE, MAP_SIZE } from '@/game/map/settings.js'
import MapFactory from '@/game/map/MapFactory.js'
import Map from '@/components/Map.vue'

export default {
  name: 'Play',
  components: {
    'v-map': Map,
  },
  data () {
    return {
      TILE_SIZE,
      GRID_SIZE,
      MAP_SIZE,
      rendered: false,
    }
  },
  computed: {
    ...mapState(['features', 'tiles',]),
  },
  mounted () {
    let { tiles, features, } = new MapFactory({
      grid_size: this.GRID_SIZE,
      tile_size: this.TILE_SIZE,
    })
    this.$store.dispatch('set_tiles', tiles)
    this.$store.dispatch('set_features', features)
    this.renderConsoleMap()
    this.rendered = true
  },

  methods: {
    renderConsoleMap () {
      let output = ''
      output += '   | '
      for (let xi = 0; xi < this.GRID_SIZE; xi += 1) {
        if (
          xi === 0 ||
          xi === Math.floor(this.GRID_SIZE / 2) ||
          xi === this.GRID_SIZE - 1
        ) {
          output += xi + ' |'
        } else {
          output += '  | '
        }
      }
      output += '\n'
      output += '    ' + '-'.repeat(this.GRID_SIZE * 4)
      output += '\n'

      for (let y = 0; y < this.GRID_SIZE; y += 1) {
        if (y < 10) output += ' '
        output += y + ' | '
        for (let x = 0; x < this.GRID_SIZE; x += 1) {
          let tile = this.tiles[x][y] !== null ? this.tiles[x][y] : ' '
          output += tile + ' | '
        }
        output += '\n'
        output += '    ' + '-'.repeat(this.GRID_SIZE * 4)
        output += '\n'
      }

      console.log(output)
    },
  },
}
</script>
