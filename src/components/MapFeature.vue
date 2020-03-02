<script>
import { IDS } from '@/game/map/settings.js'

export default {
  inject: ['canvas',],

  props: ['feature', 'scale',],

  render () {
    if (!this.canvas.context) return
    this.render_feature(this.feature.render_point_groups)
  },

  methods: {
    render_feature (point_groups, type) {
      type = type || this.feature.id

      for (let i = 0; i < point_groups.length; i += 1) {
        const group = point_groups[i]
        const is_array = Array.isArray(group)
        const is_object = typeof group === 'object'
        const has_nested_arrays = Array.isArray(group[0])

        if (is_array && !has_nested_arrays) {
          this.draw_points(group, type)
          continue
        }

        if (is_array) {
          for (let j = 0; j < group.length; j += 1) {
            this.render_feature([group[j],], type)
          }
        }

        if (!is_array && is_object) {
          for (let [key, points,] of Object.entries(group)) {
            if (points.length === 0) {
              continue
            }
            this.render_feature(points, key)
          }
        }
      }
    },
    draw_points (points, type) {
      if (points.length === 0) {
        return
      }

      type = type || this.feature.id
      points = this.apply_scale(points, this.scale)
      const is_line = this.feature.is_line || false
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
      if (type === IDS.MOUNTAIN_FEATURE_ID || type === IDS.TERRAIN_FEATURE_ID) {
        context.lineWidth = 6
        context.strokeStyle = '#ccc'
        context.stroke()
      } else if (type === IDS.LAKE_FEATURE_ID) {
        context.fillStyle = 'rgb(63, 104, 255)'
        context.fill()
      } else if (type === IDS.RIVER_FEATURE_ID) {
        context.lineWidth = 12
        context.lineCap = 'round'
        context.strokeStyle = 'rgb(63, 104, 255)'
        context.stroke()
      } else if (type === 'leaves') {
        context.fillStyle = 'rgba(33, 218, 141, 0.7)'
        context.fill()
      } else if (type === 'trunks') {
        context.lineWidth = 8
        context.lineCap = 'round'
        context.strokeStyle = 'rgba(206, 171, 154, 1)'
        context.stroke()
      } else if (type === 'branches') {
        context.lineWidth = 6
        context.lineCap = 'round'
        context.strokeStyle = 'rgba(206, 171, 154, 1)'
        context.stroke()
      } else {
        context.lineWidth = 2
        context.strokeStyle = '#000'
        context.stroke()
      }
      context.restore()
    },

    apply_scale (points, scale) {
      for (let i = 0, num_points = points.length; i < num_points; i += 1) {
        let { x, y, } = points[i]
        x *= scale
        y *= scale
        points[i] = { x, y, }
      }
      return points
    },
  },
}
</script>
