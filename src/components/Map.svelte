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

    import { renderable, getRandomInt, getRandomIntInclusive } from '../game.js';

    export const debug = false
    export const render_once = false
    export let rendered = false
    export let feature_rules = {
        mountains: {min: 2, max: 2, num_slots: 9},
        lakes: {min: 2, max: 4},
        rivers: {min: 1, max: 1},
        forests: {min: 2, max: 4},
        responsive_grids: {
            500: 3,
            1000: 4,
        },
    }
    export let map = {
        size: null,
        grid: null,
        slot_size: null,
        slots: [],
        used_slots: [],
        features: [],
    }

    renderable(props => {
        if (render_once && rendered) {
            return;
        }

        const { context, width, height } = props

        if (map.features.length <= 0) {
            map.size = width

            let breakpoints = Object.keys(feature_rules.responsive_grids).map((k) => parseInt(k, 10))
            breakpoints.push(map.size)
            breakpoints.sort((a, b) => a - b)
            const __tmp_size_idx = breakpoints.indexOf(map.size)
            const breakpoint_idx = (__tmp_size_idx < breakpoints.length - 1) ? breakpoints[__tmp_size_idx + 1] : breakpoints[__tmp_size_idx-1]
            map.grid = feature_rules.responsive_grids[breakpoint_idx]
            map.slots = [...new Array(map.grid ** 2).keys()]
            map.slot_size = map.size / map.grid

            map.features = {
                mountains: generateMountains(),
                lakes: generateLakes()
            }
        }

        context.clearRect(0, 0, width, height)

        for (let i = 0, num_mountains = map.features.mountains.length; i < num_mountains; i += 1) {
            const mountain = map.features.mountains[i]
            for (let ri = 0, rings = mountain.length; ri < rings; ri += 1) {
                const ring = mountain[ri]
                renderPoints(context, ring, 'mountain')
            }
        }

        for (let i = 0, num_mountains = map.features.lakes.length; i < num_mountains; i += 1) {
            const lake = map.features.lakes[i]
            renderPoints(context, lake, 'lake')
        }

        rendered = true
    });

    function generateLakes () {
        let lakes = []
        let available_slots = map.slots.slice(0)
        available_slots = available_slots.filter(i => map.used_slots.indexOf(i) === -1)

        const num_lakes = getRandomIntInclusive(feature_rules.lakes.min, feature_rules.lakes.max)
        for (let li = 0; li < num_lakes; li += 1) {
            const num_open_slots = available_slots.length
            const slot_idx = getRandomInt(0, num_open_slots)
            const slot = available_slots[slot_idx]
            const slot_coords = {
                x: Math.floor(slot / map.grid),
                y: slot % map.grid
            }

            const lake_spacing = map.size * 0.05
            const lake_min_size = map.slot_size / 6
            const lake_max_size = map.slot_size / 1.5
            const lake_dimensions = {
                width: getRandomIntInclusive(lake_min_size, lake_max_size),
                height: getRandomIntInclusive(lake_min_size, lake_max_size),
            }
            const lake_min_coords = {
                x: map.slot_size * slot_coords.x,
                y: map.slot_size * slot_coords.y,
            }
            const lake_max_coords = {
                x: lake_min_coords.x + map.slot_size - lake_dimensions.width,
                y: lake_min_coords.y + map.slot_size - lake_dimensions.height,
            }
            const lake_coords = {
                x: getRandomIntInclusive(lake_min_coords.x, lake_max_coords.x),
                y: getRandomIntInclusive(lake_min_coords.y, lake_max_coords.y),
            }
            const lake_center = {
                x: lake_coords.x + (lake_dimensions.width / 2),
                y: lake_coords.y + (lake_dimensions.height / 2),
            }
            const lake = generateRingPoints(
                lake_center,
                lake_dimensions,
                lake_spacing,
                7,
            )
            lakes.push(lake)
            map.used_slots.push(slot)
            available_slots.splice(slot_idx, 1)
        }

        return lakes
    }

    function generateMountains () {
        let mountains = []
        let available_slots = map.slots.slice(0)
        if (map.grid === 3) {
            available_slots.splice(4, 1)
        }
        const num_mountains = getRandomIntInclusive(feature_rules.mountains.min, feature_rules.mountains.max)
        for (let mi = 0; mi < num_mountains; mi += 1) {
            const num_open_slots = available_slots.length
            const slot_idx = getRandomInt(0, num_open_slots)
            const slot = available_slots[slot_idx]
            const slot_coords = {
                x: Math.floor(slot / map.grid),
                y: slot % map.grid
            }

            const mountain_size = map.slot_size
            const mountain_dimensions = { width: mountain_size, height: mountain_size }
            const mountain_center = {
                x: (mountain_size * slot_coords.x) + (mountain_size / 2),
                y: (mountain_size * slot_coords.y) + (mountain_size / 2),
            }
            const mountain_spacing = map.size * 0.05
            const mountain =  generateNestedRings(
                mountain_center,
                mountain_dimensions,
                mountain_spacing,
                16, 4, 2
            )

            mountains.push(mountain)
            map.used_slots.push(slot)

            for (let i = -1; i < 2; i += 1) {
                const x = slot_coords.x + i;
                if (x < 0 || x > map.grid - 1) continue

                for (let j = -1; j < 2; j += 1) {
                    const y = slot_coords.y + j
                    if (y < 0 || y > map.grid - 1) continue

                    const rm_slot = (map.grid * x) + y
                    const rm_slot_idx = available_slots.indexOf(rm_slot)
                    if (rm_slot_idx < 0) continue

                    available_slots.splice(rm_slot_idx, 1)
                }
            }
        }

        return mountains
    }

    function generateNestedRings(center, dimensions, gap, max_points, min_points, step) {
        let rings = []

        for (let num_points = max_points; num_points >= min_points; num_points -= step) {
            if (num_points < max_points) {
                dimensions.width -= gap
                dimensions.height -= gap
            }

            if (dimensions.width < gap || dimensions.height < gap) {
                break
            }

            // are we going to break on the next run? skip a step
            if (num_points - step >= min_points
                && (dimensions.width - gap < gap || dimensions.height - gap < gap)
            ) {
                num_points = min_points
            }

            rings.push(generateRingPoints(center, dimensions, gap, num_points))
        }

        return rings
    }

    function generateRingPoints(center, dimensions, variance, num_points) {
        let points = []

        if  (dimensions.width <= variance || dimensions.height <= variance) {
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
            const min_x = (dimensions.width / 2) - variance
            const max_x = (dimensions.width / 2)

            const min_y = (dimensions.height / 2) - variance
            const max_y = (dimensions.height / 2)

            const rx = getRandomInt(min_x, max_x)
            const ry = getRandomInt(min_y, max_y)

            const x = center.x - (rx * Math.cos(i));
            const y = center.y + (ry * Math.sin(i));

            points.push({x, y})
        }

        return points
    }

    function renderPoints (context, points, type) {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 0, totalPoints = points.length; i < totalPoints; i += 1) {
            const p_curr_idx = (i < totalPoints) ? i : i - totalPoints
            const p_neg1_idx = (p_curr_idx > 0) ? p_curr_idx - 1 : totalPoints - p_curr_idx - 1
            const p_pos1_idx = (p_curr_idx + 1 <= totalPoints - 1) ? p_curr_idx + 1 : p_curr_idx - totalPoints + 1
            const p_pos2_idx = (p_curr_idx + 2 <= totalPoints - 1) ? p_curr_idx + 2 : p_curr_idx - totalPoints + 2

            const p_curr = points[p_curr_idx];
            const p_neg1 = points[p_neg1_idx];
            const p_pos1 = points[p_pos1_idx];
            const p_pos2 = points[p_pos2_idx];

            const cp_curr_x = p_curr.x + (p_pos1.x - p_neg1.x) / 6;
            const cp_curr_y = p_curr.y + (p_pos1.y - p_neg1.y) / 6;

            const cp_pos1_x = p_pos1.x - (p_pos2.x - p_curr.x) / 6;
            const cp_pos1_y = p_pos1.y - (p_pos2.y - p_curr.y) / 6;

            context.bezierCurveTo(cp_curr_x, cp_curr_y, cp_pos1_x, cp_pos1_y, p_pos1.x, p_pos1.y);
        }

        if (type === 'mountain') {
            context.lineWidth = 2;
            context.strokeStyle = '#ccc';
            context.stroke();
        } else if (type === 'lake') {
            context.fillStyle = 'blue';
            context.fill();
        } else {
            context.lineWidth = 2;
            context.strokeStyle = '#000';
            context.stroke();
        }
    }
</script>

<slot></slot>
