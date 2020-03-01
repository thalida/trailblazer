import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tiles: null,
    features: null,
  },
  mutations: {
    set_tiles (state, tiles) {
      state.tiles = tiles
    },
    set_features (state, features) {
      state.features = features
    },
  },
  actions: {
    set_tiles ({ commit, }, tiles) {
      commit('set_tiles', tiles)
    },
    set_features ({ commit, }, features) {
      commit('set_features', features)
    },
  },
  modules: {},
})
