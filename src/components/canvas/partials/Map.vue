<script>
import { getRandomInt, getRandomIntInclusive } from '@/game.js'
export default {
  // CODE INSPIRATION / SOURCES
  //
  // Ways of drawing a smooth curve
  // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
  //
  // MDN quadraticCurveTo
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo
  //
  // Moving A Point Along Ellipse
  // https://stackoverflow.com/questions/14863188/moving-a-point-along-ellipse

  // Gets us the canvas property from the parent <my-canvas> component.
  inject: ['canvas',],

  data () {
    const MOUNTAIN_TILE_NAME = 'mountain'
    const LAKE_TILE_NAME = 'lake'
    const RIVER_TILE_NAME = 'river'
    const FOREST_TILE_NAME = 'forest'

    const MOUNTAIN_TILE_ID = 1
    const LAKE_TILE_ID = 2
    const RIVER_TILE_ID = 3
    const FOREST_TILE_ID = 4

    const tile_size = 100
    const grid_size = 40
    const canvas_size = tile_size * grid_size

    let tile_config = {
      mountain: {
        name: MOUNTAIN_TILE_NAME,
        id: MOUNTAIN_TILE_ID,
        count: 0,
        max_quantity: getRandomInt(10, grid_size),
        min_size: 1,
        max_size: 3,
      },
      lake: {
        name: LAKE_TILE_NAME,
        id: LAKE_TILE_ID,
        count: 0,
        max_quantity: getRandomInt(10, grid_size),
        min_size: 1,
        max_size: 2,
      },
      river: {
        name: RIVER_TILE_NAME,
        id: RIVER_TILE_ID,
        count: 0,
        max_quantity: getRandomInt(
          grid_size,
          Math.floor(Math.sqrt(grid_size ** 2 * 2))
        ),
        min_size: 1,
        max_size: 1,
      },
      forest: {
        name: FOREST_TILE_NAME,
        id: FOREST_TILE_ID,
        count: 0,
        max_quantity: getRandomInt(10, grid_size),
        min_size: 1,
        max_size: 3,
      },
    }
    const tile_types = Object.keys(tile_config)
    const total_tile_types = tile_types.length

    let tiles = []
    for (let i = 0; i < grid_size; i++) {
      tiles.push(new Array(grid_size))
    }
    let total_tiles = grid_size ** 2
    let total_used_tiles = 0
    let last_river_tile = { x: null, y: null, }

    return {
      MOUNTAIN_TILE_NAME,
      LAKE_TILE_NAME,
      RIVER_TILE_NAME,
      FOREST_TILE_NAME,
      MOUNTAIN_TILE_ID,
      LAKE_TILE_ID,
      RIVER_TILE_ID,
      FOREST_TILE_ID,
      tile_config,
      tile_types,
      total_tile_types,
      tile_size,
      canvas_size,
      grid_size,
      tiles,
      total_tiles,
      total_used_tiles,
      last_river_tile,
    }
  },

  computed: {
    total_remaining_tiles () {
      return this.total_tiles - this.total_used_tiles
    },
  },

  mounted () {
    this.generateTiles()

    let output = ''
    for (let x = 0; x < this.grid_size; x += 1) {
      for (let y = 0; y < this.grid_size; y += 1) {
        let tile = this.tiles[x][y] !== null ? this.tiles[x][y] + ' ' : '  '
        output += tile
      }
      output += '\n'
    }

    console.log(this.tiles)
    console.log(output)
    // this.features = {
    //   mountains: this.generateMountains(),
    //   lakes: this.generateLakes(),
    // }
  },

  render () {
    // if (!this.canvas.context || !this.features) return
    // for (
    //   let i = 0, num_mountains = this.features.mountains.length;
    //   i < num_mountains;
    //   i += 1
    // ) {
    //   const mountain = this.features.mountains[i]
    //   for (let ri = 0, rings = mountain.length; ri < rings; ri += 1) {
    //     const ring = mountain[ri]
    //     this.renderPoints(ring, 'mountain')
    //   }
    // }
    // for (
    //   let i = 0, num_mountains = this.features.lakes.length;
    //   i < num_mountains;
    //   i += 1
    // ) {
    //   const lake = this.features.lakes[i]
    //   this.renderPoints(lake, 'lake')
    // }
  },

  methods: {
    generateTiles () {
      console.log(this.tile_config, this.tile_config.river.max_quantity)
      for (let x = 0; x < this.grid_size; x += 1) {
        for (let y = 0; y < this.grid_size; y += 1) {
          let used_tiles = 0
          let probabilities = this.getProbabilities(x, y)
          // console.log(probabilities)

          const rand = Math.random()
          const ranges = Object.values(probabilities)
          ranges.push(rand)
          ranges.sort((a, b) => a - b)
          const found_range_idx = ranges.indexOf(rand) + 1

          if (found_range_idx < ranges.length) {
            const found_range_val = ranges[found_range_idx]
            const tile_name = Object.keys(probabilities).find(
              k => probabilities[k] === found_range_val
            )
            const tile_config = this.tile_config[tile_name]
            const tile_id = tile_config.id
            const min_available_space = Math.min(
              this.grid_size - x,
              this.grid_size - y
            )
            const min_size = tile_config.min_size
            const max_size = Math.min(tile_config.max_size, min_available_space)
            const size = getRandomInt(min_size, max_size)

            for (let xsize = 0; xsize < size; xsize += 1) {
              for (let ysize = 0; ysize < size; ysize += 1) {
                const tile_x = x + xsize
                const tile_y = y + ysize
                this.$set(this.tiles[tile_x], tile_y, tile_id)
                used_tiles += 1
              }
            }

            if (tile_id === this.RIVER_TILE_ID) {
              this.last_river_tile = { x, y, }
            }
          } else {
            this.$set(this.tiles[x], y, null)
            used_tiles = 1
          }

          this.total_used_tiles += used_tiles
        }
      }
    },
    getProbabilities (x, y) {
      let range = 0
      let probabilities = {}
      const surrounding_tiles = this.getSurroundingTiles(x, y)

      for (let i = 0; i < this.total_tile_types; i += 1) {
        const tile_type = this.tile_types[i]
        const type_config = this.tile_config[tile_type]
        const num_remaining = type_config.max_quantity - type_config.count
        let chance = num_remaining / this.total_remaining_tiles

        // surrounding_tiles.prev_tiles.indexOf(this.RIVER_TILE_ID) >= 0
        if (
          tile_type === this.RIVER_TILE_NAME &&
          this.last_river_tile.x !== null &&
          this.last_river_tile.y !== null
        ) {
          if (
            this.last_river_tile.x <= x &&
            x <= this.last_river_tile.x + 1 &&
            this.last_river_tile.y <= y &&
            y <= this.last_river_tile.y + 1
          ) {
            const open_river_tiles = this.getSurroundingTiles(
              this.last_river_tile.x,
              this.last_river_tile.y
            ).num_open_next_tiles
            chance = 1 / open_river_tiles
          } else {
            chance = 0
          }
        }

        range += chance
        probabilities[tile_type] = range
      }
      return probabilities
    },
    getSurroundingTiles (x, y) {
      let tiles = []
      let prev_tiles = []
      let next_tiles = []
      let num_open_tiles = 0
      let num_open_prev_tiles = 0
      let num_open_next_tiles = 0

      for (let xi = -1; xi < 2; xi += 1) {
        let tile_x = x + xi
        if (tile_x < 0 || tile_x >= this.grid_size) {
          continue
        }

        for (let yi = -1; yi < 2; yi += 1) {
          let tile_y = y + yi
          if (tile_y < 0 || tile_y >= this.grid_size) {
            continue
          }

          if (tile_x === x && tile_y === y) {
            continue
          }

          const tile = this.tiles[tile_x][tile_y]
          const is_open = typeof tile === 'undefined'
          tiles.push(tile)
          num_open_tiles += is_open ? 1 : 0

          if (xi < 0 || yi < 0) {
            prev_tiles.push(tile)
            num_open_prev_tiles += is_open ? 1 : 0
          }

          if (xi > 0 || yi > 0) {
            next_tiles.push(tile)
            num_open_next_tiles += is_open ? 1 : 0
          }
        }
      }

      return {
        tiles,
        prev_tiles,
        next_tiles,
        num_open_tiles,
        num_open_prev_tiles,
        num_open_next_tiles,
      }
    },
    generateLakes () {
      let lakes = []
      let available_slots = this.slots.slice(0)
      available_slots = available_slots.filter(
        i => this.used_slots.indexOf(i) === -1
      )
      const num_lakes = getRandomIntInclusive(
        this.config.lakes.min,
        this.config.lakes.max
      )
      for (let li = 0; li < num_lakes; li += 1) {
        const num_open_slots = available_slots.length
        const slot_idx = getRandomInt(0, num_open_slots)
        const slot = available_slots[slot_idx]
        const slot_coords = {
          x: Math.floor(slot / this.grid_size),
          y: slot % this.grid_size,
        }
        const lake_spacing = this.canvas.size * 0.05
        const lake_min_size = this.slot_size / 6
        const lake_max_size = this.slot_size / 1.5
        const lake_dimensions = {
          width: getRandomIntInclusive(lake_min_size, lake_max_size),
          height: getRandomIntInclusive(lake_min_size, lake_max_size),
        }
        const lake_min_coords = {
          x: this.slot_size * slot_coords.x,
          y: this.slot_size * slot_coords.y,
        }
        const lake_max_coords = {
          x: lake_min_coords.x + this.slot_size - lake_dimensions.width,
          y: lake_min_coords.y + this.slot_size - lake_dimensions.height,
        }
        const lake_coords = {
          x: getRandomIntInclusive(lake_min_coords.x, lake_max_coords.x),
          y: getRandomIntInclusive(lake_min_coords.y, lake_max_coords.y),
        }
        const lake_center = {
          x: lake_coords.x + lake_dimensions.width / 2,
          y: lake_coords.y + lake_dimensions.height / 2,
        }
        const lake = this.generateRingPoints(
          lake_center,
          lake_dimensions,
          lake_spacing,
          7
        )
        lakes.push(lake)
        this.used_slots.push(slot)
        available_slots.splice(slot_idx, 1)
      }
      return lakes
    },
    generateMountains () {
      let mountains = []
      let available_slots = this.slots.slice(0)
      if (this.grid_size === 3) {
        available_slots.splice(4, 1)
      }
      const num_mountains = getRandomIntInclusive(
        this.config.mountains.min,
        this.config.mountains.max
      )
      for (let mi = 0; mi < num_mountains; mi += 1) {
        const num_open_slots = available_slots.length
        const slot_idx = getRandomInt(0, num_open_slots)
        const slot = available_slots[slot_idx]
        const slot_coords = {
          x: Math.floor(slot / this.grid_size),
          y: slot % this.grid_size,
        }
        const mountain_size = this.slot_size
        const mountain_dimensions = {
          width: mountain_size,
          height: mountain_size,
        }
        const mountain_center = {
          x: mountain_size * slot_coords.x + mountain_size / 2,
          y: mountain_size * slot_coords.y + mountain_size / 2,
        }
        const mountain_spacing = this.canvas.size * 0.05
        const mountain = this.generateNestedRings(
          mountain_center,
          mountain_dimensions,
          mountain_spacing,
          16,
          4,
          2
        )
        mountains.push(mountain)
        this.used_slots.push(slot)
        for (let i = -1; i < 2; i += 1) {
          const x = slot_coords.x + i
          if (x < 0 || x > this.grid_size - 1) continue
          for (let j = -1; j < 2; j += 1) {
            const y = slot_coords.y + j
            if (y < 0 || y > this.grid_size - 1) continue
            const rm_slot = this.grid_size * x + y
            const rm_slot_idx = available_slots.indexOf(rm_slot)
            if (rm_slot_idx < 0) continue
            available_slots.splice(rm_slot_idx, 1)
          }
        }
      }
      return mountains
    },
    generateNestedRings (center, dimensions, gap, max_points, min_points, step) {
      let rings = []
      for (
        let num_points = max_points;
        num_points >= min_points;
        num_points -= step
      ) {
        if (num_points < max_points) {
          dimensions.width -= gap
          dimensions.height -= gap
        }
        if (dimensions.width < gap || dimensions.height < gap) {
          break
        }
        // are we going to break on the next run? skip a step
        if (
          num_points - step >= min_points &&
          (dimensions.width - gap < gap || dimensions.height - gap < gap)
        ) {
          num_points = min_points
        }
        rings.push(this.generateRingPoints(center, dimensions, gap, num_points))
      }
      return rings
    },
    generateRingPoints (center, dimensions, variance, num_points) {
      let points = []
      if (dimensions.width <= variance || dimensions.height <= variance) {
        if (dimensions.width < dimensions.height) {
          variance = dimensions.width / 3
        } else {
          variance = dimensions.height / 3
        }
      } else {
        variance = variance / 2
      }
      const circleEnd = 2 * Math.PI
      const steps = circleEnd / num_points
      for (let i = 0; i < circleEnd; i += steps) {
        const min_x = dimensions.width / 2 - variance
        const max_x = dimensions.width / 2
        const min_y = dimensions.height / 2 - variance
        const max_y = dimensions.height / 2
        const rx = getRandomInt(min_x, max_x)
        const ry = getRandomInt(min_y, max_y)
        const x = center.x - rx * Math.cos(i)
        const y = center.y + ry * Math.sin(i)
        points.push({ x, y, })
      }
      return points
    },
    renderPoints (points, type) {
      const context = this.canvas.context
      context.save()
      context.beginPath()
      context.moveTo(points[0].x, points[0].y)
      for (let i = 0, totalPoints = points.length; i < totalPoints; i += 1) {
        const p_curr_idx = i < totalPoints ? i : i - totalPoints
        const p_neg1_idx =
          p_curr_idx > 0 ? p_curr_idx - 1 : totalPoints - p_curr_idx - 1
        const p_pos1_idx =
          p_curr_idx + 1 <= totalPoints - 1
            ? p_curr_idx + 1
            : p_curr_idx - totalPoints + 1
        const p_pos2_idx =
          p_curr_idx + 2 <= totalPoints - 1
            ? p_curr_idx + 2
            : p_curr_idx - totalPoints + 2
        const p_curr = points[p_curr_idx]
        const p_neg1 = points[p_neg1_idx]
        const p_pos1 = points[p_pos1_idx]
        const p_pos2 = points[p_pos2_idx]
        const cp_curr_x = p_curr.x + (p_pos1.x - p_neg1.x) / 6
        const cp_curr_y = p_curr.y + (p_pos1.y - p_neg1.y) / 6
        const cp_pos1_x = p_pos1.x - (p_pos2.x - p_curr.x) / 6
        const cp_pos1_y = p_pos1.y - (p_pos2.y - p_curr.y) / 6
        context.bezierCurveTo(
          cp_curr_x,
          cp_curr_y,
          cp_pos1_x,
          cp_pos1_y,
          p_pos1.x,
          p_pos1.y
        )
      }
      if (type === 'mountain') {
        context.lineWidth = 2
        context.strokeStyle = '#ccc'
        context.stroke()
      } else if (type === 'lake') {
        context.fillStyle = 'blue'
        context.fill()
      } else {
        context.lineWidth = 2
        context.strokeStyle = '#000'
        context.stroke()
      }
      context.restore()
    },
  },
}
</script>
