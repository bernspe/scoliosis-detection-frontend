import * as actions from './actions';
import mutations from './mutations';
import state from './state';
import * as getters from './getters';
import auth from "./modules/auth";

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import webSocket from "@/store/modules/webSocket";

Vue.use(Vuex)


// Make Axios play nice with Django CSRF
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default new Vuex.Store ({
    modules: { auth, webSocket },
    namespaced: true,
    mutations,
    actions,
    state,
   getters
});



