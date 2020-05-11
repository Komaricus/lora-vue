import Vue from 'vue'
import Vuex from 'vuex'
import { Loading, Notification } from 'element-ui';
import {ElLoadingComponent} from "element-ui/types/loading";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    leftMenu: false,
    loading: true,
    loadingInstance: {} as ElLoadingComponent,
    messages: []
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
      if (payload) {
        state.loadingInstance = Loading.service({
          fullscreen: true,
          lock: true,
          body: false,
          background: 'rgba(0, 0, 0, 0.7)'
        });
      } else {
        state.loadingInstance.close();
      }
    },
    notify(state, options) {
      if (!state.messages.includes(options.message as never)) {
        state.messages.push(options.message as never);
        Notification(options);
        setTimeout(() => {
          state.messages.shift()
        }, 100)
      }

    }
  },
  actions: {
  },
  modules: {
  }
})
