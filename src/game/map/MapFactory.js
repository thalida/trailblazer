import { IDS } from '@/game/map/settings.js'
import {
  getRandomInt,
  getRandomIntInclusive,
  getRandomBoolean
} from '@/game/helpers.js'

export default class MapFactory {
  constructor ({ grid_size, tile_size, }) {
    let { tiles, features, } = this.generateMap({
      grid_size,
      tile_size,
    })

    return { tiles, features, }
  }

  setupFeatures (grid_size, tile_size) {
    let features = {
      [IDS.MOUNTAIN_FEATURE_ID]: {
        id: IDS.MOUNTAIN_FEATURE_ID,
        name: 'mountain',
        min_quantity: Math.ceil(grid_size / 4),
        max_quantity: grid_size,
        quantity: 0,
        min_size: 1,
        max_size: 5,
        is_line: false,
        point_per_tile: 2,
        allow_touching: 'never',
        render_point_groups: [],
        count: 0,
        last_placed_tile: { x: null, y: null, size: null, },
      },
      [IDS.LAKE_FEATURE_ID]: {
        id: IDS.LAKE_FEATURE_ID,
        name: 'lake',
        min_quantity: Math.ceil(grid_size / 4),
        max_quantity: grid_size,
        quantity: 0,
        min_size: 1,
        max_size: 2,
        is_line: false,
        render_point_groups: [],
        count: 0,
        last_placed_tile: { x: null, y: null, size: null, },
      },
      [IDS.RIVER_FEATURE_ID]: {
        id: IDS.RIVER_FEATURE_ID,
        name: 'river',
        min_quantity: grid_size,
        max_quantity: Math.floor(Math.sqrt(grid_size ** 2 * 2)),
        quantity: 0,
        min_size: 1,
        max_size: 1,
        allow_touching: 'always',
        is_line: true,
        render_point_groups: [],
        count: 0,
        last_placed_tile: { x: null, y: null, size: null, },
      },
      [IDS.FOREST_FEATURE_ID]: {
        id: IDS.FOREST_FEATURE_ID,
        name: 'forest',
        min_quantity: Math.ceil(grid_size / 4),
        max_quantity: grid_size,
        quantity: 0,
        min_size: 2,
        max_size: 6,
        min_tree_size: tile_size / 4,
        max_tree_size: tile_size / 2,
        min_tree_density: 3,
        max_tree_density: 5,
        is_line: false,
        render_point_groups: [],
        count: 0,
        last_placed_tile: { x: null, y: null, size: null, },
      },
      [IDS.TERRAIN_FEATURE_ID]: {
        id: IDS.TERRAIN_FEATURE_ID,
        name: 'terrain',
        is_filler: true,
        is_line: true,
        render_point_groups: [],
        count: 0,
      },
    }

    for (let kv of Object.entries(features)) {
      let feature = kv[1]

      if (feature.is_filler) {
        continue
      }

      feature.quantity = getRandomIntInclusive(
        feature.min_quantity,
        feature.max_quantity
      )
    }

    return features
  }

  setupTiles (grid_size) {
    let arr = []
    for (let i = 0; i < grid_size; i++) {
      arr.push(new Array(grid_size))
    }

    return arr
  }

  generateMap ({ grid_size, tile_size, }) {
    let features = this.setupFeatures(grid_size, tile_size)
    let tiles = this.setupTiles(grid_size)
    let num_tiles_remaining = grid_size ** 2
    const max_feature_size = this.getLargestFeatureSize(features)

    for (let y = 0; y < grid_size; y += 1) {
      for (let x = 0; x < grid_size; x += 1) {
        let tile = tiles[x][y]

        if (typeof tile !== 'undefined') {
          continue
        }

        const last_river_tile = features[IDS.RIVER_FEATURE_ID].last_placed_tile
        const surrounding_tiles = this.getSurroundingTiles(
          tiles,
          last_river_tile.x,
          last_river_tile.y,
          grid_size
        )
        const potential_river_tiles = surrounding_tiles.open_next_tiles
        const force_tile_river =
          potential_river_tiles.length === 1 &&
          potential_river_tiles[0].x === x &&
          potential_river_tiles[0].y === y

        let feature, size
        if (force_tile_river) {
          feature = features[IDS.RIVER_FEATURE_ID]
          size = 1
        } else {
          let max_available_space = 1
          let search = 1
          while (search < max_feature_size) {
            if (x + search >= grid_size || y + search >= grid_size) {
              break
            }

            const right_tile_coords = {
              x: x + search,
              y,
            }
            const down_tile_coords = {
              x,
              y: y + search,
            }
            const diag_tile_coords = {
              x: x + search,
              y: y + search,
            }

            const right_tile = tiles[right_tile_coords.x][right_tile_coords.y]
            const down_tile = tiles[down_tile_coords.x][down_tile_coords.y]
            const diag_tile = tiles[diag_tile_coords.x][diag_tile_coords.y]

            let near_river_tile = false
            for (let si = 0; si < potential_river_tiles.length; si += 1) {
              const prt = potential_river_tiles[si]
              const matches_curr = prt.x === x && prt.y === y
              const matches_right =
                prt.x === right_tile_coords.x && prt.y === right_tile_coords.y
              const matches_down =
                prt.x === down_tile_coords.x && prt.y === down_tile_coords.y
              const matches_diag =
                prt.x === diag_tile_coords.x && prt.y === diag_tile_coords.y

              if (
                matches_curr ||
                matches_right ||
                matches_down ||
                matches_diag
              ) {
                near_river_tile = true
                break
              }
            }

            if (
              !near_river_tile &&
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

          let feature_sizes = {}
          for (let [id, feature,] of Object.entries(features)) {
            if (feature.is_filler) {
              continue
            }
            const min_size = Math.min(feature.min_size, max_available_space)
            const max_size = Math.min(feature.max_size, max_available_space)
            feature_sizes[id] = getRandomIntInclusive(min_size, max_size)
          }

          let probabilities = this.getProbabilities({
            x,
            y,
            tiles,
            num_tiles_remaining,
            features,
            feature_sizes,
            grid_size,
          })
          const ranges = Object.values(probabilities)
          const rand = Math.random()
          ranges.push(rand)
          ranges.sort((a, b) => a - b)
          const found_range_idx = ranges.indexOf(rand) + 1
          if (found_range_idx > ranges.length - 1) {
            tiles[x][y] = null
            num_tiles_remaining -= 1
            continue
          }

          const found_range_val = ranges[found_range_idx]
          const __tmp_feature_id = Object.keys(probabilities).find(
            k => probabilities[k] === found_range_val
          )

          feature = features[__tmp_feature_id]
          size = feature_sizes[feature.id]
        }

        let used_tiles = 0
        for (let xsize = 0; xsize < size; xsize += 1) {
          for (let ysize = 0; ysize < size; ysize += 1) {
            const tile_x = x + xsize
            const tile_y = y + ysize
            tiles[tile_x][tile_y] = feature.id
            num_tiles_remaining -= 1
          }
        }

        const spacing = tile_size
        const min_position = {
          x: tile_size * x,
          y: tile_size * y,
        }
        const max_position = {
          x: tile_size * (x + size),
          y: tile_size * (y + size),
        }
        const center = {
          x: min_position.x + (max_position.x - min_position.x) / 2,
          y: min_position.y + (max_position.y - min_position.y) / 2,
        }
        let feature_points = null
        if (feature.id === IDS.MOUNTAIN_FEATURE_ID) {
          const min_render_size = tile_size + (size - 1) * tile_size
          const max_render_size = size * tile_size
          const width = getRandomIntInclusive(min_render_size, max_render_size)
          const height = getRandomIntInclusive(min_render_size, max_render_size)
          const dimensions = { width: width, height: height, }
          const max_points = feature.point_per_tile * size * 2
          const min_points = feature.point_per_tile * 2
          feature_points = this.generateNestedRings(
            center,
            dimensions,
            spacing,
            max_points,
            min_points,
            4
          )
        } else if (feature.id === IDS.LAKE_FEATURE_ID) {
          const min_render_size = tile_size / 2 + (size - 1) * tile_size
          const max_render_size = size * tile_size
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
        } else if (feature.id === IDS.RIVER_FEATURE_ID) {
          feature_points = this.generatePoint(min_position, max_position)
        } else if (feature.id === IDS.FOREST_FEATURE_ID) {
          const tree_density = getRandomIntInclusive(
            feature.min_tree_density,
            feature.max_tree_density
          )
          const num_trees = size * tree_density
          const min_tree_size = feature.min_tree_size
          const max_tree_size = feature.max_tree_size
          feature_points = this.generateTrees({
            num_trees,
            min_tree_size,
            max_tree_size,
            min_position,
            max_position,
          })
        }

        features[feature.id].last_placed_tile = { x, y, size, }
        if (feature.id === IDS.RIVER_FEATURE_ID) {
          if (features[feature.id].render_point_groups.length === 0) {
            features[feature.id].render_point_groups.push([])
          }
          features[feature.id].render_point_groups[0].push(feature_points)
        } else {
          features[feature.id].render_point_groups.push(feature_points)
        }
        features[feature.id].count += 1
        num_tiles_remaining -= used_tiles
      }
    }

    let terrain_set = []
    for (let y = 0; y < grid_size; y += 1) {
      for (let x = 0; x < grid_size; x += 1) {
        let tile = tiles[x][y]
        let valid_tile = tile === null || tile == IDS.FOREST_FEATURE_ID
        if (!valid_tile) {
          features[IDS.TERRAIN_FEATURE_ID].render_point_groups.push(terrain_set)
          features[IDS.TERRAIN_FEATURE_ID].count += terrain_set.length
          terrain_set = []
          continue
        }

        const min_position = {
          x: tile_size * x,
          y: tile_size * y,
        }
        const max_position = {
          x: tile_size * (x + 1),
          y: tile_size * (y + 1),
        }

        let feature_points = this.generatePoint(min_position, max_position)
        terrain_set.push(feature_points)
        tiles[x][y] += IDS.TERRAIN_FEATURE_ID
        num_tiles_remaining -= 1
      }

      features[IDS.TERRAIN_FEATURE_ID].render_point_groups.push(terrain_set)
      features[IDS.TERRAIN_FEATURE_ID].count += terrain_set.length
      terrain_set = []
    }

    return {
      tiles,
      features,
    }
  }

  getProbabilities ({
    x,
    y,
    tiles,
    num_tiles_remaining,
    features,
    feature_sizes,
    grid_size,
  }) {
    let range = 0
    let probabilities = {}
    const feature_ids = Object.keys(features)

    for (let i = 0; i < feature_ids.length; i += 1) {
      const __tmp_feature_id = feature_ids[i]
      const feature = features[__tmp_feature_id]

      if (feature.is_filler) {
        continue
      }

      const num_remaining = feature.quantity - feature.count

      if (num_remaining <= 0 || num_tiles_remaining <= 0) {
        probabilities[feature.id] = 0
        continue
      }

      const last_tile = feature.last_placed_tile
      let chance = num_remaining / num_tiles_remaining

      if (
        (feature.allow_touching !== 'always' &&
          feature.allow_touching !== 'never') ||
        last_tile.x === null ||
        last_tile.y === null
      ) {
        range += chance
        probabilities[feature.id] = range
        continue
      }

      if (feature.allow_touching === 'always') {
        const min_x = last_tile.x
        const min_y = last_tile.y
        const max_x = last_tile.x + last_tile.size - 1
        const max_y = last_tile.y + last_tile.size - 1
        const is_touching =
          x >= min_x - 1 && x <= max_x + 1 && y >= min_y - 1 && y <= max_y + 1

        if (!is_touching) {
          probabilities[feature.id] = 0
          continue
        }

        const surrounding_tiles = this.getSurroundingTiles(
          tiles,
          last_tile.x,
          last_tile.y,
          grid_size
        )
        const open_tiles = surrounding_tiles.num_open_next_tiles
        chance = 1 / open_tiles

        range += chance
        probabilities[feature.id] = range
        continue
      }

      if (feature.allow_touching === 'never') {
        const size = feature_sizes[feature.id]
        const surrounding_tiles = this.getSurroundingTiles(
          tiles,
          x,
          y,
          grid_size,
          size
        )
        if (surrounding_tiles.tiles.indexOf(feature.id) >= 0) {
          probabilities[feature.id] = 0
          continue
        }

        range += chance
        probabilities[feature.id] = range
        continue
      }
    }
    return probabilities
  }

  getSurroundingTiles (tiles, x, y, grid_size, size) {
    size = size || 1
    let surrounding_tiles = []
    let open_next_tiles = []

    for (let xi = -1; xi < size + 1; xi += 1) {
      let tile_x = x + xi
      if (tile_x < 0 || tile_x >= grid_size) {
        continue
      }

      for (let yi = -1; yi < size + 1; yi += 1) {
        let tile_y = y + yi
        if (tile_y < 0 || tile_y >= grid_size) {
          continue
        }

        if (tile_x === x && tile_y === y) {
          continue
        }

        const tile = tiles[tile_x][tile_y]
        const is_open = typeof tile === 'undefined'
        const is_next = xi > 0 || yi > 0
        surrounding_tiles.push(tile)
        if (is_open && is_next) {
          open_next_tiles.push({ x: tile_x, y: tile_y, })
        }
      }
    }

    return {
      tiles: surrounding_tiles,
      open_next_tiles,
      num_open_next_tiles: open_next_tiles.length,
    }
  }

  getLargestFeatureSize (features) {
    const keys = Object.keys(features)
    let found_largest = null
    for (let i = 0; i < keys.length; i += 1) {
      const id = keys[i]
      const feature = features[id]
      if (found_largest === null || feature.max_size > found_largest) {
        found_largest = feature.max_size
      }
    }

    return found_largest
  }

  generatePoint (min_position, max_position) {
    const x = getRandomIntInclusive(min_position.x, max_position.x)
    const y = getRandomIntInclusive(min_position.y, max_position.y)
    return { x, y, }
  }

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
  }

  generateTrees ({
    num_trees,
    min_tree_size,
    max_tree_size,
    min_position,
    max_position,
  }) {
    let trees = {
      trunks: [],
      branches: [],
      leaves: [],
    }
    for (let i = 0; i < num_trees; i += 1) {
      const dimensions = {
        width: getRandomIntInclusive(min_tree_size, max_tree_size),
        height: getRandomIntInclusive(min_tree_size, max_tree_size),
      }
      const min_x = min_position.x + dimensions.width / 2
      const max_x = max_position.x - dimensions.width / 2
      const min_y = min_position.y + dimensions.height / 2
      const max_y = max_position.y - dimensions.height / 2
      const center = {
        x: getRandomIntInclusive(min_x, max_x),
        y: getRandomIntInclusive(min_y, max_y),
      }
      const has_left_branch = getRandomBoolean()
      const has_right_branch = getRandomBoolean()

      trees.leaves.push(this.generateRingPoints(center, dimensions, 0, 5))

      trees.trunks.push([
        { x: center.x, y: center.y, },
        { x: center.x, y: center.y + dimensions.height / 1.2, },
      ])

      if (has_left_branch) {
        const branch_length = getRandomIntInclusive(
          dimensions.width / 6,
          dimensions.width / 4
        )
        const branch_y = getRandomIntInclusive(
          center.y - dimensions.height / 4,
          center.y + dimensions.height / 4
        )
        const branch_trunk_y =
          center.y +
          getRandomIntInclusive(dimensions.height / 6, dimensions.height / 4)
        trees.branches.push([
          { x: center.x - branch_length, y: branch_y, },
          { x: center.x, y: branch_trunk_y, },
        ])
      }

      if (has_right_branch) {
        const branch_length = getRandomIntInclusive(
          dimensions.width / 6,
          dimensions.width / 4
        )
        const branch_y = getRandomIntInclusive(
          center.y - dimensions.height / 4,
          center.y + dimensions.height / 4
        )
        const branch_trunk_y =
          center.y +
          getRandomIntInclusive(dimensions.height / 6, dimensions.height / 4)
        trees.branches.push([
          { x: center.x + branch_length, y: branch_y, },
          { x: center.x, y: branch_trunk_y, },
        ])
      }
    }

    return trees
  }

  generateRingPoints (center, dimensions, variance, num_points) {
    let points = []
    if (
      variance === null ||
      dimensions.width <= variance ||
      dimensions.height <= variance
    ) {
      if (dimensions.width < dimensions.height) {
        variance = dimensions.width / 2
      } else {
        variance = dimensions.height / 2
      }
    }
    variance = variance / 2
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
  }
}
