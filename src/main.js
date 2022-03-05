import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from "@/router";
import store from "@/store";
import VueNativeSock from "vue-native-websocket";
import VueTour from "vue-tour";
import "vue-tour/dist/vue-tour.css";
import AsyncComputed from 'vue-async-computed'
import VueGoogleCharts from 'vue-google-charts'
import loader from "vue-ui-preloader";

import { Auth0Plugin } from "./auth";
import { domain, clientId, audience } from "../auth_config.json";

//import { library } from "@fortawesome/fontawesome-svg-core";
//import { faLink, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
//import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

//import * as Sentry from "@sentry/vue";
//import { Integrations } from "@sentry/tracing";

Vue.use(loader);
Vue.use(VueGoogleCharts)
Vue.use(AsyncComputed)

Vue.use(VueNativeSock, 'ws://skoliosekinder.de/ws/', {
    reconnection: true, // (Boolean) whether to reconnect automatically (false)
    reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
    reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000),
    connectManually: true,

})

Vue.config.productionTip = false
Vue.use(VueTour);
Vue.use(router)

Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});

//library.add(faLink, faUser, faPowerOff);
//Vue.component("font-awesome-icon", FontAwesomeIcon);

/*
Sentry.init({
  Vue,
  dsn: "https://009ff6ec392e41db9c1b9c2d545f2ff6@o432741.ingest.sentry.io/6103314",
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ["localhost", "skoliosekinder.de", /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
*/
new Vue({
    router,
    vuetify,
    store,
  render: h => h(App)
}).$mount('#app');

