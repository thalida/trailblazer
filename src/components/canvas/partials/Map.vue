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
    const max_feature_size = 5

    let tile_config = {
      mountain: {
        name: MOUNTAIN_TILE_NAME,
        id: MOUNTAIN_TILE_ID,
        count: 0,
        max_quantity: getRandomIntInclusive(10, grid_size),
        min_size: 2,
        max_size: 3,
        allow_touching: 'never',
      },
      lake: {
        name: LAKE_TILE_NAME,
        id: LAKE_TILE_ID,
        count: 0,
        max_quantity: getRandomIntInclusive(10, grid_size),
        min_size: 1,
        max_size: 2,
      },
      river: {
        name: RIVER_TILE_NAME,
        id: RIVER_TILE_ID,
        count: 0,
        max_quantity: getRandomIntInclusive(
          grid_size,
          Math.floor(Math.sqrt(grid_size ** 2 * 2))
        ),
        min_size: 1,
        max_size: 1,
        allow_touching: 'always',
      },
      forest: {
        name: FOREST_TILE_NAME,
        id: FOREST_TILE_ID,
        count: 0,
        max_quantity: getRandomIntInclusive(10, grid_size),
        min_size: 1,
        max_size: 4,
      },
    }
    const tile_types = Object.keys(tile_config)
    const total_tile_types = tile_types.length

    let points = {}
    let tiles = []
    for (let i = 0; i < grid_size; i++) {
      tiles.push(new Array(grid_size))
    }
    let total_tiles = grid_size ** 2
    let total_used_tiles = 0
    let last_tile_by_type = {
      mountain: { x: null, y: null, size: null, },
      lake: { x: null, y: null, size: null, },
      river: { x: null, y: null, size: null, },
      forest: { x: null, y: null, size: null, },
    }

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
      max_feature_size,
      tiles,
      points,
      total_tiles,
      total_used_tiles,
      last_tile_by_type,
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
    output += '   | '
    for (let xi = 0; xi < this.grid_size; xi += 1) {
      if (
        xi === 0 ||
        xi === Math.floor(this.grid_size / 2) ||
        xi === this.grid_size - 1
      ) {
        output += xi + ' |'
      } else {
        output += '  | '
      }
    }
    output += '\n'
    output += '    ' + '-'.repeat(this.grid_size * 4)
    output += '\n'

    for (let y = 0; y < this.grid_size; y += 1) {
      if (y < 10) output += ' '
      output += y + ' | '
      for (let x = 0; x < this.grid_size; x += 1) {
        let tile = this.tiles[x][y] !== null ? this.tiles[x][y] : ' '
        output += tile + ' | '
      }
      output += '\n'
      output += '    ' + '-'.repeat(this.grid_size * 4)
      output += '\n'
    }

    console.log(this.points)
    console.log(output)
  },

  render () {
    if (!this.canvas.context || !this.points) return

    for (let i = 0; i < this.total_tile_types; i += 1) {
      const type = this.tile_types[i]

      if (!Array.isArray(this.points[type])) {
        continue
      }

      if (type === 'forest') {
        continue
      }

      const points = this.points[type]

      if (!Array.isArray(points[0])) {
        this.renderPoints(points, type, true)
        continue
      }

      for (let fi = 0, num_feature = points.length; fi < num_feature; fi += 1) {
        const feature = points[fi]

        if (type === this.MOUNTAIN_TILE_NAME) {
          for (let ri = 0, rings = feature.length; ri < rings; ri += 1) {
            const ring = feature[ri]
            this.renderPoints(ring, type)
          }
        } else {
          this.renderPoints(feature, type)
        }
      }
    }
  },

  methods: {
    generateTiles () {
      for (let y = 0; y < this.grid_size; y += 1) {
        for (let x = 0; x < this.grid_size; x += 1) {
          let tile = this.tiles[x][y]

          if (typeof tile !== 'undefined') {
            continue
          }

          let max_available_space = 1
          let search = 1
          while (search < this.max_feature_size) {
            if (x + search >= this.grid_size || y + search >= this.grid_size) {
              break
            }

            const right_tile = this.tiles[x + search][y]
            const down_tile = this.tiles[x][y + search]
            const diag_tile = this.tiles[x + search][y + search]

            if (
              typeof right_tile === 'undefined' &&
              typeof down_tile === 'undefined' &&
              typeof diag_tile === 'undefined'
            ) {
              max_available_space += 1
              search += 1
            } else {
              break
            }
          }

          let type_sizes = {}
          for (let type_i = 0; type_i < this.total_tile_types; type_i += 1) {
            const tile_type = this.tile_types[type_i]
            const tile_config = this.tile_config[tile_type]
            const min_size = Math.min(tile_config.min_size, max_available_space)
            const max_size = Math.min(tile_config.max_size, max_available_space)
            type_sizes[tile_type] = getRandomIntInclusive(min_size, max_size)
          }

          let probabilities = this.getProbabilities(x, y, type_sizes)
          const ranges = Object.values(probabilities)
          const rand = Math.random()
          ranges.push(rand)
          ranges.sort((a, b) => a - b)
          const found_range_idx = ranges.indexOf(rand) + 1

          if (found_range_idx > ranges.length - 1) {
            this.$set(this.tiles[x], y, null)
            this.total_used_tiles += 1
            continue
          }

          const found_range_val = ranges[found_range_idx]
          const tile_name = Object.keys(probabilities).find(
            k => probabilities[k] === found_range_val
          )
          const tile_config = this.tile_config[tile_name]
          const tile_id = tile_config.id
          const size = type_sizes[tile_name]
          let used_tiles = 0
          for (let xsize = 0; xsize < size; xsize += 1) {
            for (let ysize = 0; ysize < size; ysize += 1) {
              const tile_x = x + xsize
              const tile_y = y + ysize
              this.$set(this.tiles[tile_x], tile_y, tile_id)
              used_tiles += 1
            }
          }

          const spacing = this.tile_size / 2
          const min_position = {
            x: this.tile_size * x,
            y: this.tile_size * y,
          }
          const max_position = {
            x: this.tile_size * (x + size),
            y: this.tile_size * (y + size),
          }
          const center = {
            x: min_position.x + (max_position.x - min_position.x) / 2,
            y: min_position.y + (max_position.y - min_position.y) / 2,
          }
          let feature_points = null
          if (tile_name === this.MOUNTAIN_TILE_NAME) {
            const min_render_size =
              this.tile_size / 2 + (size - 1) * this.tile_size
            const max_render_size = size * this.tile_size
            const feature_size = getRandomIntInclusive(
              min_render_size,
              max_render_size
            )
            const dimensions = { width: feature_size, height: feature_size, }
            feature_points = this.generateNestedRings(
              center,
              dimensions,
              spacing,
              16,
              4,
              2
            )
          } else if (tile_name === this.LAKE_TILE_NAME) {
            const min_render_size =
              this.tile_size / 2 + (size - 1) * this.tile_size
            const max_render_size = size * this.tile_size
            const dimensions = {
              width: getRandomIntInclusive(min_render_size, max_render_size),
              height: getRandomIntInclusive(min_render_size, max_render_size),
            }
            feature_points = this.generateRingPoints(
              center,
              dimensions,
              spacing,
              7
            )
          } else if (tile_name === this.RIVER_TILE_NAME) {
            feature_points = this.generatePoint(min_position, max_position)
          }

          if (typeof this.points[tile_name] === 'undefined') {
            this.points[tile_name] = []
          }
          this.points[tile_name].push(feature_points)

          this.last_tile_by_type[tile_name] = { x, y, size, }
          this.total_used_tiles += used_tiles
          this.tile_config[tile_name].count += 1
        }
      }
    },
    getProbabilities (x, y, sizes) {
      let range = 0
      let probabilities = {}

      for (let i = 0; i < this.total_tile_types; i += 1) {
        const tile_type = this.tile_types[i]
        const type_config = this.tile_config[tile_type]
        const num_remaining = type_config.max_quantity - type_config.count
        const last_tile = this.last_tile_by_type[tile_type]
        let chance =
          this.total_remaining_tiles > 0
            ? num_remaining / this.total_remaining_tiles
            : 0

        if (
          (type_config.allow_touching !== 'always' &&
            type_config.allow_touching !== 'never') ||
          last_tile.x === null ||
          last_tile.y === null
        ) {
          range += chance
          probabilities[tile_type] = range
          continue
        }

        if (type_config.allow_touching === 'always') {
          const min_x = last_tile.x
          const min_y = last_tile.y
          const max_x = last_tile.x + last_tile.size - 1
          const max_y = last_tile.y + last_tile.size - 1
          const is_touching =
            x >= min_x - 1 && x <= max_x + 1 && y >= min_y - 1 && y <= max_y + 1

          if (!is_touching) {
            probabilities[tile_type] = 0
            continue
          }

          const open_tiles = this.getSurroundingTiles(
            this.last_tile_by_type[tile_type].x,
            this.last_tile_by_type[tile_type].y
          ).num_open_next_tiles
          chance = 1 / open_tiles

          range += chance
          probabilities[tile_type] = range
          continue
        }

        if (type_config.allow_touching === 'never') {
          const size = sizes[tile_type]
          const surrounding_tiles = this.getSurroundingTiles(x, y, size)
          if (surrounding_tiles.tiles.indexOf(type_config.id) >= 0) {
            probabilities[tile_type] = 0
            continue
          }

          range += chance
          probabilities[tile_type] = range
          continue
        }
      }
      return probabilities
    },
    getSurroundingTiles (x, y, size) {
      size = size || 1
      let tiles = []
      let prev_tiles = []
      let next_tiles = []
      let num_open_tiles = 0
      let num_open_prev_tiles = 0
      let num_open_next_tiles = 0

      for (let xi = -1; xi < size + 1; xi += 1) {
        let tile_x = x + xi
        if (tile_x < 0 || tile_x >= this.grid_size) {
          continue
        }

        for (let yi = -1; yi < size + 1; yi += 1) {
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
    generatePoint (min_position, max_position) {
      const x = getRandomIntInclusive(min_position.x, max_position.x)
      const y = getRandomIntInclusive(min_position.y, max_position.y)
      return { x, y, }
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
    renderPoints (points, type, is_line) {
      is_line = is_line || false
      const context = this.canvas.context
      context.save()
      context.beginPath()
      context.moveTo(points[0].x, points[0].y)
      let total_points = points.length
      let max_loops = is_line ? total_points - 1 : total_points
      for (let i = 0; i < max_loops; i += 1) {
        let p_curr_idx, p_neg1_idx, p_pos1_idx, p_pos2_idx
        if (is_line) {
          p_curr_idx = i
          p_pos1_idx = p_curr_idx + 1
        } else {
          p_curr_idx = i < total_points ? i : i - total_points
          p_neg1_idx =
            p_curr_idx > 0 ? p_curr_idx - 1 : total_points - p_curr_idx - 1
          p_pos1_idx =
            p_curr_idx + 1 <= total_points - 1
              ? p_curr_idx + 1
              : p_curr_idx - total_points + 1
          p_pos2_idx =
            p_curr_idx + 2 <= total_points - 1
              ? p_curr_idx + 2
              : p_curr_idx - total_points + 2
        }

        const p_curr = points[p_curr_idx]
        const p_neg1 = points[p_neg1_idx]
        const p_pos1 = points[p_pos1_idx]
        const p_pos2 = points[p_pos2_idx]

        if (is_line) {
          const xc = (p_curr.x + p_pos1.x) / 2
          const yc = (p_curr.y + p_pos1.y) / 2
          context.quadraticCurveTo(p_curr.x, p_curr.y, xc, yc)
        } else {
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
      }
      if (type === this.MOUNTAIN_TILE_NAME) {
        context.lineWidth = 2
        context.strokeStyle = '#ccc'
        context.stroke()
      } else if (type === this.LAKE_TILE_NAME) {
        context.fillStyle = 'blue'
        context.fill()
      } else if (type === this.RIVER_TILE_NAME) {
        context.lineWidth = 4
        context.strokeStyle = 'blue'
        context.stroke()
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
