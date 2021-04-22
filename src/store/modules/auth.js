import router from "@/router";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';


export const STATUS = {
  error: "error",
  loading: "loading",
  success: "success",
    pause:"pause"
};


export const MEDROLES  = {
        'MedPhysician': 'Arzt',
        'MedPediatric': 'Kinderarzt',
        'MedOrthopaedic': 'Orthopäde / Chirurg',
        'MedSpecialist': 'Skoliosespezialist',
        'MedOrthoTechnician': 'Orthopädietechniker',
        'Physician': 'Arzt',
        'Pediatric Physician': 'Kinderarzt',
        'Orthopaedic Physician': 'Orthopäde / Chirurg',
        'Scoliosis Specialist': 'Skoliosespezialist',
        'Orthopaedic Technician': 'Orthopädietechniker'
};

export const DE_CONSENTS = {
      'P0': 'Allgemeine Datenschutzerklärung',
      'P1A': 'Datenverarbeitungserklärung',
      'P1B': 'Datenverarbeitungserklärung für meine Kinder',
      'P1C': 'Datenverarbeitungserklärung des Kindes',
      'P2': 'Erklärung zur Verarbeitung des Bildmaterials',
      'P3': 'Erklärung zur Datenweitergabe an Dritte',
      'P4': 'Erklärung zum Teilen von Daten mit Dritten',
      'P5': 'Vertraulichkeitsvereinbarung'
  };

// initial state
const state = () => ({
  user: null,
   isAuthenticated: false,
    isLoginAuth: false,
    authProvider:null,
    tempBirthday:null,
  status: "",
    endpoints: {
      userroles: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_USERROLES_SUFFIX,
    },

    rolestree: [
              {
                  id:1,
                  name: 'Kinder',
                  children: [
                      {id:2,
                      name:'Gesundes Kind (keine Skoliose)' ,
                      value: 'ChildNoScoliosis'},
                { id:3,
                    name: 'Kind mit diagnostizierter Skoliose' ,
                value: 'ChildScoliosis'}]
        },
              {
                id: 4,
                name: 'Erwachsene',
                  children: [
                      {id: 5,
                      name: 'Erziehungsverantwortlicher / Elternteil',
                      value: 'Caregiver'},
                      {id: 6,
                          name: 'Elternteil mit diagnostizierter Skoliose' ,
                          value: 'CaregiverNPatient'},
                      {id:7,
                          name:'Erwachsener Skoliosepatient',
                          value: 'AdultPatient'}]
              },
              {
              id:8,
              name:'Ärzte und Orthopädietechniker',
              children: [
                  {id:9,
                  name:'Allgemeinarzt oder nicht näher bezeichnet' ,
                  value: 'MedPhysician'},
                  {id:10,
                  name:'Kinderarzt' ,
                  value: 'MedPediatric'},
                  {id:11,
                  name:'Orthopäde oder Chirurg' ,
                  value: 'MedOrthopaedic'},
                  { id:12,
                  name: 'Skoliosespezialist' ,
                  value: 'MedSpecialist'},
                  { id:13,
                  name: 'Orthopädietechniker',
                  value: 'MedOrthoTechnician'}
              ]}

      ],


});

// getters
const getters = {
    isValidatedUser: (state) => {
        if (!state.user){
            return false
        }
        let g= state.user.groups.map(x => x.name)
        return g.includes('Validated User')
    },

    isNonValidatedUser: (state) => {
        if (!state.user){
            return false
        }
        let g= state.user.groups.map(x => x.name)
        return g.includes('Non validated User')
    },
    isStaff: (state) => {
        if (!state.user){
            return false
        }
        let g= state.user.groups.map(x => x.name)
        return (g.includes('Staff') | (state.user['is_superuser']))
    },

    isCaregiver: (state) => {
        if (!state.user){
            return false
        }
        let g= state.user.roles
        return (g.includes('Caregiver'))
    },


    getterUsernameSimple: (state) => {
      if (state.user) {
          return state.user.username;
      } else {
          return null;
      }
    },
    getterUsername: (state) =>  {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return 'UnknownUser'
        } else {
            variable = state.user.username;
            if (typeof variable === 'undefined' || variable === null) {
                return 'UnknownUser'
            } else {
                return variable
             }
            }
        },
    getterFirstname: (state) =>  {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return 'UnknownUser'
        } else {
            variable = state.user.first_name;
            if ((typeof variable === 'undefined') || (variable === null)) {
                return 'UnknownUser'
            } else {
                return variable
             }
            }
        },
    getterBirthday: (state) => {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return null
        } else {
            variable = state.user.date_of_birth;
            if ((typeof variable === 'undefined') || (variable === null)) {
                return null
            } else {
                return variable
             }
            }
    },

    getterUserObject: (state) => {
       return state.user;
    },


    isAuthenticated:  (state) => {
        return state.isAuthenticated;
    },

    getterStatus: (state) => {
        return state.status;
    },

    getterLoginAuth:(state)=> {
        return state.isLoginAuth;
    }
};

// mutations
const mutations = {

    checkAuthentication (state) {
         let token = localStorage.getItem('token');
        let isLoginAuth;
        if ((typeof token === 'undefined') || (token === null )) {
                isLoginAuth = false
            } else {
                var variable = state.user;
                if ((typeof variable === 'undefined') || (variable === null)) {
                    isLoginAuth = false
                } else {
                   isLoginAuth = true
                }
             }
      state.isLoginAuth=isLoginAuth
    },

    resetAuthStatus(state) {
          state.user=null;
          state.status="";
          state.isAuthenticated=false;
      },
    isAuthenticated (state, payload) {
        state.isAuthenticated = payload.isAuthenticated
        state.authProvider = payload.authProvider
    },

    setUser(state, payload) {
        state.status = STATUS.success;
        state.isAuthenticated = true;
        state.user = payload;
    },


    setUsernameWhileForgot(state, payload) {
        state.user = payload;
    },

    setTemporaryBirthday(state, payload) {
        state.tempBirthday=payload.tempBirthday;
    },

  loginRequest(state) {
    state.status = STATUS.loading;
  },
    loginPause(state) {
      state.status = STATUS.pause;
    },
  loginFailure(state) {
    state.status = STATUS.error;
    state.user = null;
  },
  logout(state) {
    state.status = "";
    state.user = null;
    state.isAuthenticated = false;
    state.authProvider = null;
    localStorage.removeItem('token');
    if (router.currentRoute.name !== "entrypage") {
      router.push("/");
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions: {
      getMinimalUserProfiles({rootState},payload){
        return new Promise((resolve, reject) => {
            const config = {
                  url: rootState.endpoints.baseUrl+"getminprofilefromusers/",
                method: 'POST',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                  data: {'usernames':payload.usernames}
              }
                  axios(config)
                      .then((response) => {
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
      },
      getUserProfiles({rootState}){
        return new Promise((resolve, reject) => {
            const config = {
                  url: rootState.endpoints.baseUrl+process.env["VUE_APP_USERACCOUNTS_SUFFIX"],
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
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
      },
      getAccountDetails({rootState}) {
          return new Promise((resolve, reject) => {
        const config = {
                  url: rootState.endpoints.baseUrl+"userinfo/",
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  }
              }
                  axios(config)
                      .then((response) => {
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
        },
     getDependentChildren({rootState}) {
          return new Promise((resolve, reject) => {
        const config = {
                  url: rootState.endpoints.baseUrl+"getdependentchildren/",
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  }
              }
                  axios(config)
                      .then((response) => {
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
        },

     getCaregiver({rootState}) {
          return new Promise((resolve, reject) => {
        const config = {
                  url: rootState.endpoints.baseUrl+"getcaregiver/",
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  }
              }
                  axios(config)
                      .then((response) => {
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
        },


      getConsentDetails({rootState}) {
          return new Promise((resolve, reject) => {
        const config = {
                  url: rootState.endpoints.baseUrl+process.env["VUE_APP_CONSENT"],
                method: 'GET',
                  headers: {
                      'authorization': `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  }
              }
                  axios(config)
                      .then((response) => {
                      resolve(response.data)
                  }).catch((e) => {
                      reject(e)
                  })
                }, 1000)
        },
      // Check token and retrieve user data
      checkToken ({commit, rootState}){
          return new Promise((resolve, reject) => {
              // get and set auth user
              console.log('Checking Token: ', rootState.token)
              if (rootState.token) {
                  const config = {
                      url: rootState.endpoints.baseUrl + "userinfo/",
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
                      console.log('Setting User to ', response.data)
                      commit("setUser", response.data)
                      resolve()
                  }).catch((e) => {
                      console.log(e)
                      commit('logout')
                      reject(e)
                  })
              } else {
                  reject('Missing Token')
              }
          })
        },
      // Login via own OAuth Server
        login({commit, rootState }, { email, password }) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('grant_type', rootState.oauth_credentials.grant_type);
                    data.append('scope', rootState.oauth_credentials.scope);
                    data.append('email', email);
                    data.append('password', password);
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_TOKEN_URL_SUFFIX,
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            commit('updateToken', response.data.access_token, {root: true});
                            commit('isAuthenticated', {
                                 isAuthenticated: true,
                                 authProvider: 'login'
                            })
                            resolve()
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            })
        },


      register({commit, rootState }, { email, password, firstName, lastName }) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    console.log(`Attempt to register ${email}:${password}`);
                    var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('grant_type', rootState.oauth_credentials.grant_type);
                    data.append('scope', rootState.oauth_credentials.scope);
                    data.append('email', email);
                    data.append('password', password);
                    data.append('first_name',firstName);
                    data.append('last_name',lastName);
                    data.append('username', uuidv4());
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_OAUTH_REGISTER_SUFFIX,
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            //console.log('Got token: ',response.data)
                            commit('updateToken', response.data.access_token, {root: true});
                            commit('isAuthenticated', {
                                 isAuthenticated: true,
                                 authProvider: 'login'
                            })
                            resolve()
                            /*
                            const data = response.data;
                            commit('setListData', {entries: data}, {root: true});
                             */
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            })
        },

      registerChild({state, commit, rootState }, { email, first_name, last_name , birthday}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    console.log(`Attempt to register child ${email}`);
                    var data = {
                        'username':uuidv4(),
                        'email': email,
                        'first_name':first_name,
                        'last_name':last_name,
                        'date_of_birth': birthday,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl+"users/"+state.user.username+'/'+process.env.VUE_APP_ADDCHILD,
                        data: data,
                        headers: {
                          authorization: `Bearer ${rootState.token}`,
                          'Content-Type': 'application/json'
                      },
                      xhrFields: {
                          withCredentials: true
                      }
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },

      registerInvitedUserEmail({rootState }, { email, first_name, last_name,roles }) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log(`Attempt to register user ${email}`);
                    var data = {
                        'username':uuidv4(),
                        'email': email,
                        'first_name':first_name,
                        'last_name':last_name,
                        'roles':roles,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl+process.env.VUE_APP_ADDINVITEDUSER_EMAIL,
                        data: data,
                        headers: {
                          authorization: `Bearer ${rootState.token}`,
                          'Content-Type': 'application/json'
                      },
                      xhrFields: {
                          withCredentials: true
                      }
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },


      registerInvitedUserPDF({rootState }, { first_name, last_name, address,roles }) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log(`Attempt to register user ${first_name}`);
                    var data = {
                        'username':uuidv4(),
                        'first_name':first_name,
                        'last_name':last_name,
                        'postal_address':address,
                        'roles':roles,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl+process.env.VUE_APP_ADDINVITEDUSER_PDF,
                        data: data,
                        headers: {
                          authorization: `Bearer ${rootState.token}`,
                          'Content-Type': 'application/json'
                      },
                      xhrFields: {
                          withCredentials: true
                      }
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },

      checkEmail({commit},{username, token}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  commit('loginRequest');
                    var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_ACTIVATION_SUFFIX"]+username+'/',
                    };
                    axios(config)
                        .then((response) => {
                            console.log('EMail Activation Response: ', response.data)
                            commit("setUser", response.data)
                            commit('updateToken', token, {root: true});
                            commit('isAuthenticated', {
                                 isAuthenticated: true,
                                 authProvider: 'login'
                            })
                            resolve()
                        }).catch((e) => {
                            commit("loginFailure");
                            console.log('Email Activation Error: ',e)
                        reject()
                    })

              }, 1000)
          })
      },

      emailExists({rootState},payload) {
          return new Promise((resolve) => {
              setTimeout(() => {
                  var config = {
                        method: 'GET',
                        url: rootState.endpoints.baseUrl + 'emailexists/',
                        params: {email:payload.email}
                    };
                    axios(config)
                        .then((response) => {
                                if (response.data.email == 'OK') {
                                    // EMail already exists
                                    resolve(false)

                                } else {
                                    // EMail is not known

                                    resolve(true)
                                }

                        })
              }, 1000)
          })
      },

      forgotPasswordEmail({commit},{email}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  commit('loginRequest');
                    var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_EMAIL"],
                        params: {
                            'email':email
                        }
                    };
                    axios(config).then((response)=>{
                        commit("loginPause")
                        commit("setUsernameWhilePasswordForgot", response.data)
                        resolve()
                    }).catch((e) => {
                        commit("loginFailure")
                        console.log('Error while sending eMail request: ',e)
                        reject()
                    })
                  }, 1000)
              })
      },

      setPasswordEmail({rootState},{email}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                    var config = {
                        method: 'GET',
                        url: rootState.endpoints.baseUrl + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_EMAIL"],
                        params: {
                            'email':email
                        }
                    };
                    axios(config).then((response)=>{
                        resolve(response)
                    }).catch((e) => {
                        console.log('Error while sending eMail request: ',e)
                        reject(e)
                    })
                  }, 1000)
              })
      },
      setNewPassword({rootState},{username, token, password}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + 'setnewpassword/',
                        data: {
                            'username':username,
                            'emailtoken':token,
                            'password':password,
                        }
                    };
                    axios(config).then((response)=>{
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                  }, 1000)
              })
      },


     eMailUser({rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_USERACCOUNTS_SUFFIX"]+payload.username+'/email/',
                        data: {
                            'subject':payload.subject,
                            'message':payload.message
                        },
                        headers: {
                          authorization: `Bearer ${rootState.token}`,
                          'Content-Type': 'application/json'
                      },
                      xhrFields: {
                          withCredentials: true
                      }
                    };
                    axios(config).then((response)=>{
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                  }, 1000)
              })
      },

      forgotPasswordLogin({commit, getters, rootState},{token, password}) {
          let username=getters.getterUsernameSimple
          console.log('Try FPL with ', username, token)
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (username) {
                    commit('loginRequest');
                         var config = {
                          method: 'POST',

                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_LOGIN"],
                          data: {
                              'username': username,
                              'password':password,
                              'emailtoken':token,
                              'client_id': rootState.oauth_credentials.client_id,
                              'client_secret': rootState.oauth_credentials.client_secret,
                              'grant_type': rootState.oauth_credentials.grant_type,
                              'scope':rootState.oauth_credentials.scope
                          }
                      };
                      axios(config).then((response) => {
                            commit('updateToken', response.data.access_token, {root: true});
                            commit('isAuthenticated', {
                                 isAuthenticated: true,
                                 authProvider: 'login'
                            })
                            resolve()
                      }).catch((e) => {
                        console.log("...failed:", e);
                        commit("loginFailure");
                        reject()
                      })
                  } else {
                      commit("loginFailure")
                      reject()
                  }
                  }, 1000)
              })
      },



      logout({commit, rootState}){
          return new Promise((resolve) => {
              setTimeout(() => {
                  //vm.$auth.logout();
                  //revoking AccessToken
                  var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('token',rootState.token)
                  var config = {
                          method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'multipart/form-data'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_TOKEN_REVOKE"],
                          data: data
                      };
                      axios(config).finally((response) => {
                        console.log(response)
                          localStorage.removeItem('token');
                        commit("logout");
                        resolve()
                      })

              }, 1000)
            })
        },

        getLoginStatus({state}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (state.status == STATUS.success)  {
                        resolve()
                    }
                    if (state.status == STATUS.failed) {
                        reject()
                    }
                }, 10000)

            })
        },
        reFetchUser({state, commit, rootState}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (state.user) {
                  const config = {
                  url: rootState.endpoints.baseUrl+"users/"+state.user.username+'/',
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
                    commit('setUser',response.data)
                    resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('ReFetch: No User active')
              }
                   }, 1000)
              })
        },

        updateAccountDetails({state, commit, rootState},payload) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (state.user) {
                      //var data = new FormData();
                      //data.append('instruction_level', 'basic');

                  const config = {
                  url: rootState.endpoints.baseUrl+"users/"+state.user.username+'/',
                method: 'PATCH',
                  headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                      data: payload
              }
            axios(config).then((response) => {
                    commit('setUser',response.data)
                    resolve(response)
                  }).catch((e) => {
                      reject(e)
                  })
              } else {
                  reject('UpdateAccount: No User active')
              }
                   }, 1000)
              })
        },
        deleteUser({state, rootState}) {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                  if (state.user) {

                  const config = {
                  url: rootState.endpoints.baseUrl+"users/"+state.user.username+'/',
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
                  reject('DeleteAccount: No User active')
              }
                   }, 1000)
              })
        }

  },
  mutations,
};
