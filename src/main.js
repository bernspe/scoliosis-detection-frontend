import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from "@/router";
import store from "@/store";
import VueNativeSock from "vue-native-websocket";
import VueTour from "vue-tour";
import "vue-tour/dist/vue-tour.css";

Vue.use(VueNativeSock, 'ws://localhost:9090', {
    reconnection: true, // (Boolean) whether to reconnect automatically (false)
    reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
    reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000),
    connectManually: true,

})


Vue.config.productionTip = false
Vue.use(VueTour);

new Vue({
  router,
  vuetify,
    store,
  render: h => h(App)
}).$mount('#app');

