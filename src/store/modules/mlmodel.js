import axios from "axios";

const state = () => ({
    openwebsockets:[],
    mlmodels: [],
    mlmodeltypes:null,
    mlterminalout:{},
    currentmlterminalout:[],
    currentMLTerminalID:null,
    currentMLTerminalPredictions:[],
    currentMLTerminalPerformances:[],
    currentMLTerminalImages:[],
})

const getters = {
    isWebSocketOpen: (state) => {
        return state.openwebsockets.includes(state.currentMLTerminalID)
    },
    getterMLModels: (state) => {
        return state.mlmodels;
    },
    getterMLModelTypes: (state) => {
        return state.mlmodeltypes;
    },
    getterDataSetModels: (state) => {
      return state.mlmodels.filter(model => model.type=='dataset')
    },
    getterMLTerminalOutput: (state)  => {
        return state.mlterminalout;
    },
    getterCurrentMLTerminalOutput: (state)  => {
        return state.currentmlterminalout.join('');
    },
    getterCurrentMLTerminalPredictions: (state)  => {
        return state.currentMLTerminalPredictions;
    },
    getterCurrentMLTerminalPerformances: (state)  => {
        return state.currentMLTerminalPerformances;
    },
    getterCurrentMLTerminalImages: (state)  => {
        return state.currentMLTerminalImages;
    }
}

const mutations = {
    setToOpenWebSockets(state, payload) {
        state.openwebsockets.push(payload)
    },
    setMLModels(state, payload) {
        state.mlmodels = payload;
        state.mlmodels.forEach(model => { state.mlterminalout[model.id]=""})
    },
    setMLModelTypes(state, payload) {
        state.mlmodeltypes = payload;
    },
    setCurrentMLTerminalID(state, payload) {
        state.currentmlterminalout=[];
        state.currentMLTerminalPredictions=[]
        state.currentMLTerminalPerformances=[]
        state.currentMLTerminalImages=[]
        state.currentMLTerminalID=payload;
    },
    pushMLTerminalMsg(state, payload) {
        if (payload.id==state.currentMLTerminalID) {
            state.currentmlterminalout.push(payload.msg_console)
        }
        //state.mlterminalout[payload.id]=payload.msg_console
    },
    pushMLTerminalResult(state, payload) {
        if (payload.id==state.currentMLTerminalID) {
            state.currentMLTerminalPredictions.push(JSON.stringify(payload.msg_prediction))
            state.currentMLTerminalPerformances.push(JSON.stringify(payload.msg_performance))
            state.currentMLTerminalImages.push(payload.msg_image)
        }
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: {
        getMLModels({rootState, commit}){
            const config = {
                  url: rootState.endpoints.baseUrl+process.env['VUE_APP_MLMODEL'],
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },

              }
                  axios(config)
                      .then((response) => {
                          commit('setMLModels',response.data)
                  }).catch((e) => {
                      console.log(e)
                  })
      },
        getMLModelTypes({rootState, commit}){
            const config = {
                  url: rootState.endpoints.baseUrl+'getmlmodeltypes/',
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },

              }
                  axios(config)
                      .then((response) => {
                          commit('setMLModelTypes',response.data)
                  }).catch((e) => {
                      console.log(e)
                  })
      },
        deleteMLModel({rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (payload ? payload.id ? true : false : false) {
                    const config = {
                    url: rootState.endpoints.baseUrl+process.env['VUE_APP_MLMODEL']+payload.id+'/',
                method: 'DELETE',
                  headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
              }
            axios(config).then((response) => {
                      resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('Delete MLMolde: No id given')
              }
                   }, 1000)
              })
        },

        updateMLModel({rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (payload ? payload.id ? true : false : false) {
                    const id = payload.id

                      const config = {
                    url: rootState.endpoints.baseUrl+process.env['VUE_APP_MLMODEL']+id+'/',
                    method: 'PATCH',
                    headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                        data: payload,
              }
            axios(config).then((response) => {
                      resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('Delete MLMolde: No id given')
              }
                   }, 1000)
              })
        },


        testMLModel({rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (payload ? payload.id ? true : false : false) {
                    const config = {
                    url: rootState.endpoints.baseUrl+process.env['VUE_APP_MLMODEL']+payload.id+'/test_model/',
                method: 'POST',
                  headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                        data: payload,
              }
            axios(config).then((response) => {
                      resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('Test MLModel: No id given')
              }
                   }, 1000)
              })
        },


        getMLModelPerformanceGraph({rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (payload ? payload.id ? true : false : false) {
                    const config = {
                    url: rootState.endpoints.baseUrl+process.env['VUE_APP_MLMODEL']+payload.id+'/get_model_performance/',
                    method: 'GET',
                  headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  }
              }
            axios(config).then((response) => {
                      resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('Performance Graph: No id given')
              }
                   }, 1000)
              })
        },

    }
}