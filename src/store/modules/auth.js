import router from "@/router";
import axios from "axios";

export const STATUS = {
  error: "error",
  loading: "loading",
  success: "success",
};

// initial state
const state = () => ({
  user: null,
  status: "",
});

// getters
const getters = {
  isLoggedIn: (state) => state.status === STATUS.success,
};

// mutations
const mutations = {
  loginRequest(state) {
    state.status = STATUS.loading;
  },
  loginSuccess(state, user) {
    state.status = STATUS.success;
    state.user = user;
  },
  loginFailure(state) {
    state.status = STATUS.error;
    state.user = null;
  },
  logout(state) {
    state.status = {};
    state.user = null;
    if (router.currentRoute.name !== "xrboard") {
      router.push("/");
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions: {
        login({commit, rootState }, { username, password }) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit("loginRequest");
                    console.log(`Attempt to login ${username}:${password}`);
                    axios.post(rootState.endpoints.obtainToken, {username, password})
                        .then((response) => {
                            commit('updateToken', response.data.token, {root: true})

                            // get and set auth user
                            const base = {
                                baseURL: rootState.endpoints.baseUrl,
                                headers: {
                                    Authorization: `Token ${rootState.token}`,
                                    'Content-Type': 'application/json'
                                },
                                xhrFields: {
                                    withCredentials: true
                                }
                            }
                            const axiosInstance = axios.create(base)
                            axiosInstance({
                                url: "/splineapp/",
                                method: "get",
                                params: {}
                            }).then((response) => {
                                rootState.axiosBase = base;
                                commit("setAuthUser", {authUser: username, isAuthenticated: true}, {root: true})
                                const data = response.data;
                                commit('setListData', {entries: data}, {root: true});
                                router.push('xrlist')
                                commit("loginSuccess", {username});
                                resolve()
                            })
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            });

        },

      logout({commit}){
            return new Promise((resolve) => {
              setTimeout(() => {
                commit("logout");
                resolve()
              }, 1000)
            })
        }
  },
  mutations,
};
