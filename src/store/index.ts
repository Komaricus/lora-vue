import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    leftMenu: false
  },
  getters: {
    getLeftMenu: state => {
      return state.leftMenu;
    }
  },
  mutations: {
    setLeftMenu(state, value) {
      state.leftMenu = value;
    }
  },
  actions: {
  },
  modules: {
  }
})
