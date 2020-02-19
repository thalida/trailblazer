import { getContext, onMount, onDestroy } from 'svelte';
import { writable, derived } from 'svelte/store';

// Some props for the app
const max_size = (window.screen.height > window.screen.width) ? window.screen.height : window.screen.width
const map_size = max_size + (max_size / 8)
export const width = writable(map_size);
export const height = writable(map_size);
export const pixelRatio = writable(window.devicePixelRatio);
export const context = writable();
export const canvas = writable();
export const time = writable(0);

// A more convenient store for grabbing all game props
export const props = deriveObject({
    context,
    canvas,
    width,
    height,
    pixelRatio,
    time
});

export const key = Symbol();

export const renderable = (render_callback) => {
    const api = getContext(key);
    const element = {
        ready: false,
        mounted: false
    };
    element.render = render_callback;
    api.add(element);
    onMount(() => {
        element.mounted = true;
        return () => {
            api.remove(element);
            element.mounted = false;
        };
    });
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function deriveObject(obj) {
    const keys = Object.keys(obj);
    const list = keys.map(key => {
        return obj[key];
    });
    return derived(list, (array) => {
        return array.reduce((dict, value, i) => {
            dict[keys[i]] = value;
            return dict;
        }, {});
    });
}
