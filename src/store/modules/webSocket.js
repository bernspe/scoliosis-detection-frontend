import Vue from 'vue'



// initial state
const state = () => ({
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false,
    }
});

// getters
const getters = {

};



const mutations = {

   SOCKET_ONOPEN (state, event)  {
      Vue.prototype.$socket = event.currentTarget
      state.socket.isConnected = true
        console.log('Socket open');
          },



};

export default {
  namespaced: true,
  state,
  getters,
    computed: {

    },
  actions: {
      registerUserSocket: {
          root: true,
          handler(namespacedContext, {username}) {
              namespacedContext.rootState.$app.$connect(namespacedContext.rootState.endpoints.webSocket + 'user/' + username + '/', {format: 'json'});
          }
    },

    closeUserSocket: {
          root:true,
        handler(namespacedContext) {
           namespacedContext.rootState.$app.$disconnect();
        }
    },

  },
 mutations,
};
