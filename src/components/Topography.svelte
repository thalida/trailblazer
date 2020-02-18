<script>
	import { renderable, getRandomInt } from '../game.js';
    export const BORDER_TOP = 'top'
    export const BORDER_RIGHT = 'right'
    export const BORDER_BOTTOM = 'bottom'
    export const BORDER_LEFT = 'left'
    export const border_order = [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT]
    export let borders = {}
    export let points = []

    export let rendered = false
    export let spacing = 50
    export let center = { x: 500, y: 400 }
    export let max_size = { width: 300, height: 300 }


	renderable(props => {
        if (rendered) {
            return;
        }

		const { context, width, height } = props;

        const min_coords = {
            x: center.x - Math.ceil(max_size.width/2),
            y: center.y - Math.ceil(max_size.height/2),
        }
        const max_coords = {
            x: center.x + Math.ceil(max_size.width/2),
            y: center.y + Math.ceil(max_size.height/2),
        }
        const num_segments = {
            x: Math.floor(max_size.width / spacing),
            y: Math.floor(max_size.height / spacing),
        }

        for (let side_i = 0, num_sides = border_order.length; side_i < num_sides; side_i++) {
            const side = border_order[side_i]
            const isHorizontal = side === BORDER_TOP || side === BORDER_BOTTOM
            let min_x, min_y, max_x, max_y
            let prev_point = null

            if (side === 'top') {
                min_y = min_coords.y,
                max_y = min_coords.y + (spacing * 1)
            } else if (side === 'bottom') {
                min_y = max_coords.y - (spacing * 1),
                max_y = max_coords.y
            } else if (side === 'left') {
                min_x = min_coords.x,
                max_x = min_coords.x + (spacing * 1)
            } else if (side === 'right') {
                min_x = max_coords.x - (spacing * 1),
                max_x = max_coords.x
            }

            const segments = (isHorizontal) ? num_segments.x : num_segments.y
            const start_idx = (isHorizontal) ? 0 : 1
            const end_idx = (isHorizontal) ? segments : segments - 1
            for (let si = start_idx; si < end_idx; si += 1) {
                let x, y

                if (isHorizontal) {
                    min_x = min_coords.x + (spacing * si)
                    max_x = min_coords.x + (spacing * (si + 1))
                } else {
                    min_y = min_coords.y + (spacing * si)
                    max_y = min_coords.y + (spacing * (si + 1))
                }

                let foundX = false
                while (!foundX) {
                    x = getRandomInt(min_x, max_x)
                    foundX = (
                        prev_point === null
                        || Math.abs(prev_point.x - x) >= Math.floor(spacing / 4)
                    )
                }

                let foundY = false
                while (!foundY) {
                    y = getRandomInt(min_y, max_y)
                    foundY = (
                        prev_point === null
                        || Math.abs(prev_point.y - y) >= Math.floor(spacing / 4)
                    )
                }

                const new_point = {x, y}
                borders[side] = borders[side] || []
                borders[side].push(new_point)
                prev_point = new_point
            }

            if (side === BORDER_TOP || side === BORDER_RIGHT) {
                points = points.concat(borders[side])
            } else {
                points = points.concat(borders[side].reverse())
            }
        }

		context.clearRect(0, 0, width, height);

        for (let i = 0; i < points.length; i += 1) {
            const nextIdx = ((i + 1) >= points.length) ? 0 : i + 1

            const {x: x1, y: y1} = points[i];
            const {x: x2, y: y2} = points[nextIdx];

            let x_mid = (x1 + x2) / 2;
            let y_mid = (y1 + y2) / 2;
            let cp_x1 = (x_mid + x1) / 2;
            let cp_x2 = (x_mid +x2) / 2;

            context.beginPath();
            context.moveTo(x1, y1);
            context.quadraticCurveTo(
                cp_x1, y1,
                x_mid, y_mid
            );
            context.quadraticCurveTo(
                cp_x2, y2,
                x2, y2
            );
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.stroke();
        }

        rendered = true
	});
</script>

<slot></slot>
