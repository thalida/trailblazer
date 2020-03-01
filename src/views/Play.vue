<template>
  <div class="play">
    <v-map v-if="show_map" v-once />
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
      show_map: false,
    }
  },
  computed: {
    ...mapState(['features', 'tiles', 'map_size',]),
  },
  mounted () {
    let { tiles, features, } = new MapFactory({
      grid_size: GRID_SIZE,
      tile_size: TILE_SIZE,
    })
    this.$store.dispatch('set_map_size', MAP_SIZE)
    this.$store.dispatch('set_tiles', tiles)
    this.$store.dispatch('set_features', features)
    this.renderConsoleMap()
    this.show_map = true
  },

  methods: {
    renderConsoleMap () {
      let output = ''
      output += '   | '
      for (let xi = 0; xi < GRID_SIZE; xi += 1) {
        if (
          xi === 0 ||
          xi === Math.floor(GRID_SIZE / 2) ||
          xi === GRID_SIZE - 1
        ) {
          output += xi + ' |'
        } else {
          output += '  | '
        }
      }
      output += '\n'
      output += '    ' + '-'.repeat(GRID_SIZE * 4)
      output += '\n'

      for (let y = 0; y < GRID_SIZE; y += 1) {
        if (y < 10) output += ' '
        output += y + ' | '
        for (let x = 0; x < GRID_SIZE; x += 1) {
          let tile = this.tiles[x][y] !== null ? this.tiles[x][y] : ' '
          output += tile + ' | '
        }
        output += '\n'
        output += '    ' + '-'.repeat(GRID_SIZE * 4)
        output += '\n'
      }

      console.log(output)
    },
  },
}
</script>
