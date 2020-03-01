<script>
import { IDS } from '@/game/map/settings.js'

export default {
  inject: ['canvas',],

  props: ['feature',],

  render () {
    if (!this.canvas.context) return

    if (this.feature.id === IDS.FOREST_FEATURE_ID) {
      console.log('skipping forest')
      return
    }

    const points = this.feature.render_points

    if (!Array.isArray(points[0])) {
      this.renderPoints(points, this.feature.id, true)
    } else {
      for (let fi = 0, num_feature = points.length; fi < num_feature; fi += 1) {
        const feature = points[fi]
        const has_nested_points = Array.isArray(feature[0])
        if (has_nested_points) {
          for (let ri = 0, rings = feature.length; ri < rings; ri += 1) {
            const ring = feature[ri]
            this.renderPoints(ring, this.feature.id)
          }
        } else {
          this.renderPoints(feature, this.feature.id)
        }
      }
    }
  },

  methods: {
    renderPoints (points, feature_id, is_line) {
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
      if (feature_id === IDS.MOUNTAIN_FEATURE_ID) {
        context.lineWidth = 2
        context.strokeStyle = '#ccc'
        context.stroke()
      } else if (feature_id === IDS.LAKE_FEATURE_ID) {
        context.fillStyle = 'blue'
        context.fill()
      } else if (feature_id === IDS.RIVER_FEATURE_ID) {
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
