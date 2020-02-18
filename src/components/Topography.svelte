<script>
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

	import { renderable, getRandomInt } from '../game.js';

    export let rendered = false
    export let debug = true
    export let force_render = false

	renderable(props => {
        if (!force_render && rendered) {
            return;
        }

		const { context, width, height } = props;

        const spacing = 50
        const center = { x: 500, y: 400 }
        const dimensions = { width: 300, height: 300 }
        const num_segments = {
            x: Math.floor(dimensions.width / spacing),
            y: Math.floor(dimensions.height / spacing),
        }
        let orig_min_points = (num_segments.x * 2) + (num_segments.y * 2) - 4
        const min_points = (orig_min_points < 3) ? 3 : orig_min_points
        const circleStart = 0 * Math.PI
        const circleEnd = 2 * Math.PI
        const steps = circleEnd / min_points

        let points = []
        for (let i = circleStart; i < circleEnd; i += steps) {
            let min_x = (dimensions.width / 2) - (spacing * 1)
            let max_x = (dimensions.width / 2)
            let rx = getRandomInt(min_x, max_x)

            let min_y = (dimensions.height / 2) - (spacing * 1)
            let max_y = (dimensions.height / 2)
            let ry = getRandomInt(min_y, max_y)


            let x = center.x - (rx * Math.cos(i));
            let y = center.y + (ry * Math.sin(i));

            points.push({x, y})
        }

        context.clearRect(0, 0, width, height)
        for (let i = 0; i < points.length; i++) {
            const p0_idx = (i > 0) ? i - 1 : points.length - 1 - i;
            const p1_idx = i
            const p2_idx = (i + 1 <= points.length - 1) ? i + 1 : i - points.length + 1
            const p3_idx = (i + 2 <= points.length - 1) ? i + 2 : i - points.length + 2

            let p0 = points[p0_idx];
            let p1 = points[p1_idx];
            let p2 = points[p2_idx];
            let p3 = points[p3_idx];

            let cp1x = p1.x + (p2.x - p0.x) / 6;
            let cp1y = p1.y + (p2.y - p0.y) / 6;

            let cp2x = p2.x - (p3.x - p1.x) / 6;
            let cp2y = p2.y - (p3.y - p1.y) / 6;

            context.beginPath();
            context.moveTo(p1.x, p1.y);
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.stroke();

            if (debug) {
                // draw point
                context.beginPath();
                context.fillStyle = 'red';
                context.arc(p1.x, p1.y, 2, 0, 2 * Math.PI);
                context.fill();
            }
        }

        rendered = true
	});
</script>

<slot></slot>
