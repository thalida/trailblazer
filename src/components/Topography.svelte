<script>
	import { renderable, getRandomInt } from '../game.js';
    export let rendered = false

	renderable(props => {
        if (rendered) {
            return;
        }

		const { context, width, height } = props;

        const center = {
            x: 150,
            y: 75,
        }
        const spacing = 50
        const max_size = { width: 300, height: 150 }
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

        let borders = {
            top: [],
            right: [],
            bottom: [],
            left: [],
        }

        for (let side = 0; side < 2; side += 1) {
            const isTop = side === 0
            let min_y, max_y;
            if (isTop) {
                min_y = min_coords.y,
                max_y = min_coords.y + spacing
            } else {
                min_y = max_coords.y - spacing,
                max_y = max_coords.y
            }

            let last_coords = null

            for (let xi = 0; xi < num_segments.x; xi += 1) {
                let x, y
                // const curveOutward = Math.random() >= 0.5
                const curveOutward = true

                const min_x = min_coords.x + (spacing * xi)
                const max_x = min_coords.x + (spacing * (xi + 1))

                let foundX = false
                while (!foundX) {
                    x = getRandomInt(min_x, max_x)
                    foundX = (
                        last_coords === null
                        || Math.abs(last_coords.x - x) >= Math.floor(spacing / 4)
                    )
                }

                let foundY = false
                while (!foundY) {
                    y = getRandomInt(min_y, max_y)
                    foundY = (
                        last_coords === null
                        || Math.abs(last_coords.y - y) >= Math.floor(spacing / 4)
                    )
                }

                if (isTop) {
                    borders.top.push({x, y, curveOutward})
                } else {
                    borders.bottom.push({x, y, curveOutward})
                }

                last_coords = {x, y}
            }
        }

        for (let side = 0; side < 2; side += 1) {
            const isLeft = side === 0
            let min_x, max_x;
            if (isLeft) {
                min_x = min_coords.x,
                max_x = min_coords.x + spacing
            } else {
                min_x = max_coords.x - spacing,
                max_x = max_coords.x
            }

            let last_coords = null

            for (let yi = 1; yi < num_segments.y - 1; yi += 1) {
                let x, y
                // const curveOutward = Math .random() >= 0.5
                const curveOutward = true

                const min_y = min_coords.y + (spacing * yi)
                const max_y = min_coords.y + (spacing * (yi + 1))

                let foundX = false
                while (!foundX) {
                    x = getRandomInt(min_x, max_x)
                    foundX = (
                        last_coords === null
                        || Math.abs(last_coords.x - x) >= Math.floor(spacing / 4)
                    )
                }

                let foundY = false
                while (!foundY) {
                    y = getRandomInt(min_y, max_y)
                    foundY = (
                        last_coords === null
                        || Math.abs(last_coords.y - y) >= Math.floor(spacing / 4)
                    )
                }

                if (isLeft) {
                    borders.left.push({x, y, curveOutward})
                } else {
                    borders.right.push({x, y, curveOutward})
                }

                last_coords = {x, y}
            }
        }

        let points = [
            ...borders.top,
            ...borders.right,
            ...borders.bottom.reverse(),
            ...borders.left.reverse(),
        ]

		context.clearRect(0, 0, width, height);

        console.log(num_segments, min_coords, max_coords, points)

        for (let i = 0; i < points.length; i += 1) {
            const nextIdx = ((i + 1) >= points.length) ? 0 : i + 1

            const {x: x1, y: y1} = points[i];
            const {x: x2, y: y2, curveOutward: curveOutward} = points[nextIdx];
            const opt_a = {x: x1, y: y2}
            const opt_b = {x: x2, y: y1}
            const d_a = Math.sqrt(Math.pow(opt_a.x - center.x, 2) + Math.pow(opt_a.y - center.y, 2))
            const d_b = Math.sqrt(Math.pow(opt_b.x - center.x, 2) + Math.pow(opt_b.y - center.y, 2))

            let cp;
            if (curveOutward) {
                if (d_a > d_b) {
                    cp = opt_a
                } else {
                    cp = opt_b
                }
            } else {
                if (d_a < d_b) {
                    cp = opt_a
                } else {
                    cp = opt_b
                }
            }

            context.beginPath();
            context.moveTo(x1, y1);
            context.quadraticCurveTo(
                cp.x, cp.y,
                x2, y2
            );
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.stroke();

            context.fillStyle = 'red';
            context.beginPath();
            context.arc(x2, y2, 5, 0, 2 * Math.PI);  // End point
            context.fill();

            context.fillStyle = 'blue';
            context.beginPath();
            context.arc(cp.x, cp.y, 5, 0, 2 * Math.PI);  // End point
            context.fill();
        }

        rendered = true
	});
</script>

<slot></slot>
