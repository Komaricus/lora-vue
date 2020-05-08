import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    leftMenu: false,
    loading: true
  },
  getters: {
    getLeftMenu: state => {
      return state.leftMenu;
    },
    getLoading: state => {
      return state.loading;
    }
  },
  mutations: {
    setLeftMenu(state, value) {
      state.leftMenu = value;
    },
    setLoading(state, payload) {
      state.loading = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
