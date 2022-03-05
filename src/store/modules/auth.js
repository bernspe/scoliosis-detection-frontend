import router from "@/router";
import axios from "axios";
import {v4 as uuidv4} from 'uuid';
import Vue from 'vue'


export const STATUS = {
    error: "error",
    loading: "loading",
    success: "success",
    pause: "pause"
};


export const DE_CONSENTS = {
    'P0': 'Allgemeine Datenschutzerklärung',
    'P1A': 'Datenverarbeitungserklärung',
    'P1B': 'Datenverarbeitungserklärung für meine Kinder',
    'P1C': 'Datenverarbeitungserklärung des Kindes',
    'P1D': 'Datenverarbeitungserklärung des Jugendlichen',
    'P2': 'Erklärung zur Verarbeitung des Bildmaterials',
    'P2A': 'Erklärung zur Verarbeitung des Bildmaterials für erwachsene Patienten',
    'P2B': 'Erklärung zur Verarbeitung des Bildmaterials für die Eltern',
    'P2C': 'Erklärung zur Verarbeitung des Bildmaterials für Kinder',
    'P2D': 'Erklärung zur Verarbeitung des Bildmaterials für Jugendliche',
    'P3': 'Erklärung zur Datenweitergabe an Dritte',
    'P4': 'Erklärung zum Teilen von Daten mit Dritten',
    'P5': 'Vertraulichkeitsvereinbarung'
};

// initial state
const state = () => ({
    user: null,
    dependentchildren: null,
    mypatients: null,
    isAuthenticated: false,
    isLoginAuth: false,
    authProvider: null,
    tempBirthday: null,
    status: "",
    userroles: null,
    userproofs: {'existing': [], 'missing': []},
    invited_user_logged_in: {username: "", full_name: ""},
    component_traces: {},
});

// getters
const getters = {
    isValidatedUser: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.groups.map(x => x.name)
        return g.includes('Validated User')
    },

    isNonValidatedUser: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.groups.map(x => x.name)
        return g.includes('Non validated User')
    },
    isStaff: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.groups.map(x => x.name)
        return (g.includes('Staff') | (state.user['is_superuser']))
    },
    isAdmin: (state) => {
        if (!state.user) {
            return false
        }
        return (state.user['is_superuser'])
    },
    isCaregiver: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.roles
        return (g.includes('Caregiver'))
    },

    isChild: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.roles
        return (g.includes('Child'))
    },
    isAdult: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.roles
        return (g.includes('Adult'))
    },

    isPatient: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.roles
        return (g.includes('Patient'))
    },

    isMed: (state) => {
        if (!state.user) {
            return false
        }
        let g = state.user.rolescategories
        return (g.includes('Med'))
    },
    getterUsernameSimple: (state) => {
        if (state.user) {
            return state.user.username;
        } else {
            return null;
        }
    },
    getterUsername: (state) => {
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
    getterFirstname: (state) => {
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
    getterFullname: (state) => {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return null
        } else {
            let variable1 = state.user.first_name;
            let variable2 = state.user.last_name;
            if ((typeof variable1 === 'undefined') || (variable1 === null) || (typeof variable2 === 'undefined') || (variable2 === null)) {
                return null
            } else {
                return variable1+' '+variable2
            }
        }
    },

    getterUserEMail: (state) => {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return null
        } else {
            variable = state.user.email;
            if ((typeof variable === 'undefined') || (variable === null)) {
                return null
            } else {
                return variable
            }
        }
    },
    getterUserRole: (state) => {
        var variable = state.user;
        if (typeof variable === 'undefined' || variable === null) {
            return null
        } else {
            variable = state.user.roles;
            if (typeof variable === 'undefined' || variable === null) {
                return null
            } else {
                return variable.join()
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


    isAuthenticated: (state) => {
        return state.isAuthenticated;
    },

    getterStatus: (state) => {
        return state.status;
    },

    getterLoginAuth: (state) => {
        return state.isLoginAuth;
    },
    getterDependentChildren: (state) => {
        return state.dependentchildren
    },
    getterMyPatients: (state) => {
        return state.mypatients
    },

    getterMissingProofs: (state) => {
        return state.userproofs.missing;
    },

    getterOverallMissingProofs: (state) => {
        return state.userproofs.missing.filter(x => !state.userproofs.existing.includes(x));
    },
    getterExistingProofs: (state) => {
        return state.userproofs.existing;
    },

    getterInvitedUserLoggedIn: (state) => {
        return state.invited_user_logged_in
    },

    getterComponentTraces: (state) => {
        return state.component_traces
    }
};

// mutations
const mutations = {

    checkAuthentication(state) {
        let token = localStorage.getItem('token');
        let isLoginAuth;
        if ((typeof token === 'undefined') || (token === null)) {
            isLoginAuth = false
        } else {
            var variable = state.user;
            if ((typeof variable === 'undefined') || (variable === null)) {
                isLoginAuth = false
            } else {
                isLoginAuth = true
            }
        }
        state.isLoginAuth = isLoginAuth
    },

    resetAuthStatus(state) {
        state.user = null;
        state.status = "";
        state.isAuthenticated = false;
    },

    isAuthenticated(state, payload) {
        state.isAuthenticated = payload.isAuthenticated
        state.authProvider = payload.authProvider
    },

    setUser(state, payload) {
        state.status = STATUS.success;
        state.isAuthenticated = true;
        state.user = payload;
    },

    setUserProof(state, payload) {
        state.userproofs = payload;
    },
    setExistingUserProofs(state, payload) {
        state.userproofs.existing = payload;
    },

    setUsernameWhileForgot(state, payload) {
        state.user = payload;
    },

    setTemporaryBirthday(state, payload) {
        state.tempBirthday = payload.tempBirthday;
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
        if (state.STATUS !== STATUS.loading) {
            state.status = "";
            state.user = null;
            state.isAuthenticated = false;
            state.authProvider = null;
            localStorage.removeItem('token');
            //  if (!fastlogindevice) {
                            localStorage.removeItem('refr');
                       // }


            if (router.currentRoute.name !== "preview") {
                router.push("/preview");
            }
        }
    },
    setDependentChildren(state, payload) {
        state.dependentchildren = payload;
    },
    setMyPatients(state, payload) {
        state.mypatients = payload;
    },


    setUserroles(state, payload) {
        //let rl = payload.map((x) => ([x.role, x.translations[process.env["VUE_APP_LANGUAGE"]]]))
        //state.userroles = Object.fromEntries(rl)
        state.userroles = payload

    },

    setMissingProofs(state, payload) {
        state.userproofs.missing = payload;
    },
    setExistingProofs(state, payload) {
        state.userproofs.existing = payload;
    },
    setInvitedUserLoggedIn(state, payload) {
        Vue.set(state.invited_user_logged_in, 'username', payload.username)
        Vue.set(state.invited_user_logged_in, 'full_name', payload.user_fullname)
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions: {
        getUserRolesDict({commit, rootState}) {
            const config = {
                url: rootState.endpoints.userroles2,
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${rootState.token}`,
                    'Content-Type': 'application/json'
                },
                xhrFields: {
                    withCredentials: true
                },
                data: {'language': process.env["VUE_APP_LANGUAGE"], 'ignoreage': true}
            }
            axios(config)
                .then((response) => {
                    commit('setUserroles', response.data)
                }).catch((e) => {
                console.log(e)
            })
        },

        getUserProofs({commit, rootState}) {
            return new Promise((resolve, reject) => {
                var config2 = {
                    method: 'GET',
                    url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                    headers: {
                        authorization: `Bearer ${rootState.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                };
                axios(config2).then((response2) => {
                    /*
                    response2.data.existing.forEach((proof) => {
                        this.existingproofs.push(proof.proof_type)
                        this.existingproofs_checkstatus.push(proof.checkedby)
                    })
                    response2.data.missing.forEach((prooftype) => {
                        this.missingproofs.push(prooftype)
                    })

                     */
                    commit('setUserProof', response2.data)
                    resolve()
                }).catch((e) => {
                    console.log(e)
                    reject()
                })
            })
        },
        getMinimalUserProfilesFromCurrentlyLoggedInUser({rootState}, payload) {
            return new Promise((resolve, reject) => {

                const config = {
                    url: rootState.endpoints.baseUrl + "getminprofilefromcurrentlyinviteduser/",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {'username': payload.username}
                }
                axios(config)
                    .then((response) => {
                        resolve(response.data)
                    }).catch((e) => {
                    reject(e)
                })
            }, 1000)
        },
        getMinimalUserProfiles({rootState}, payload) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "getminprofilefromusers/",
                    method: 'POST',
                    headers: {
                        'authorization': `Bearer ${rootState.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data: {'usernames': payload.usernames}
                }
                axios(config)
                    .then((response) => {
                        resolve(response.data)
                    }).catch((e) => {
                    reject(e)
                })
            }, 1000)
        },
        getUserProfiles({rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + process.env["VUE_APP_USERACCOUNTS_SUFFIX"],
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
                    url: rootState.endpoints.baseUrl + "userinfo/",
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

        getAccountDetailsOfSpecificUser({rootState}, payload) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "users/" + payload + '/',
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

        getDependentChildren({commit, rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "getdependentchildren/",
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
                        commit('setDependentChildren', response.data)
                        resolve(response.data)
                    }).catch((e) => {
                    reject(e)
                })
            }, 1000)
        },

        getCaregiver({rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "getcaregiver/",
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

        getMyPatients({commit, rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "users/getmypatients/",
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
                        commit('setMyPatients', response.data)
                        resolve(response.data)
                    }).catch((e) => {
                    reject(e)
                })
            }, 1000)
        },

        getMedUsers({rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "users/getmedusers/",
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


        searchUser({rootState}, payload) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + "users/searchuser/",
                    method: 'POST',
                    headers: {
                        'authorization': `Bearer ${rootState.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data: payload
                }
                axios(config)
                    .then((response) => {
                        const data = response.data
                        if (Array.isArray(data)) resolve(response.data) // list type response
                        else resolve([data]) // object type response

                    }).catch((e) => {
                    reject(e)
                })
            }, 1000)
        },


        getConsentDetails({rootState}) {
            return new Promise((resolve, reject) => {
                const config = {
                    url: rootState.endpoints.baseUrl + process.env["VUE_APP_CONSENT"],
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
        checkToken({commit, rootState}) {
            return new Promise((resolve, reject) => {
                // get and set auth user
                //console.log('Checking Token: ', rootState.token)
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
        login({commit, rootState}, {email, password, notify}) {
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
                    data.append('notify', notify);
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_TOKEN_URL_SUFFIX,
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            commit('updateToken', {
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token
                            }, {root: true});
                            commit('isAuthenticated', {
                                isAuthenticated: true,
                                authProvider: 'login'
                            })
                            commit('imagecenter/deleteListData', null, {root: true})
                            resolve()
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            })
        },

        loginWQRCode({commit, rootState}, {username, password, notify}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('grant_type', rootState.oauth_credentials.grant_type);
                    data.append('scope', rootState.oauth_credentials.scope);
                    data.append('username', username);
                    data.append('password', password);
                    data.append('notify', notify);
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_TOKEN_URL_SUFFIX,
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            commit('updateToken', {
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token
                            }, {root: true});
                            commit('isAuthenticated', {
                                isAuthenticated: true,
                                authProvider: 'login'
                            })
                            commit('imagecenter/deleteListData', null, {root: true})
                            resolve()
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            })
        },

        denyQRCodeLogin({commit}, {username, notify}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginFailure')
                    var data = {username: username, notify: notify}
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + 'denyqrcodelogin/',
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then(() => {
                            resolve()
                        }).catch((error) => {
                        console.log("...failed:", error);
                        reject()
                    })
                }, 1000)
            })
        },

        // Login via own OAuth Server with saved refreshToken
        loginWRefreshToken({ commit, rootState}) {
            //var s = state.status
            //console.log('Login Status during LoginWQRCode Loading: ', s)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!rootState.device.device_id) {
                        //console.log('No device id')
                        reject()
                    } else {
                        commit('loginRequest');
                        var refresh_token = localStorage.getItem('refr');
                        if (refresh_token) {
                            var data = new FormData();
                            data.append('client_id', rootState.oauth_credentials.client_id);
                            data.append('client_secret', rootState.oauth_credentials.client_secret);
                            data.append('grant_type', 'refresh_token');
                            data.append('scope', rootState.oauth_credentials.scope);
                            data.append('refresh_token', refresh_token);
                            data.append('uuid', rootState.device.device_id);
                            var config = {
                                method: 'POST',
                                url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_TOKEN_URL_SUFFIX,
                                data: data
                            };
                            //obtain token
                            axios(config)
                                .then((response) => {
                                    commit('updateToken', {
                                        access_token: response.data.access_token,
                                        refresh_token: response.data.refresh_token
                                    }, {root: true});
                                    commit('isAuthenticated', {
                                        isAuthenticated: true,
                                        authProvider: 'login'
                                    })
                                    commit('imagecenter/deleteListData', null, {root: true})
                                    resolve()
                                }).catch((error) => {
                                console.log("...failed:", error);
                                commit("loginFailure");
                                reject()
                            })
                        } else {
                            reject()
                        }
                    }
                }, 1000)
            })
        },

        // Login via own OAuth Server with saved refreshToken
        loginWAuth0Token({ commit, rootState}, payload) {
            //var s = state.status
            //console.log('Login Status during LoginWAuth0Token Loading: ', s)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    var data = new FormData();

                    data.append('token',payload.token );
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('scope', rootState.oauth_credentials.scope);
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_AUTH0TOKEN_URL_SUFFIX,
                        data: data
                    };
                    //obtain token
                    axios(config)
                        .then((response) => {
                            commit('updateToken', {
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token
                            }, {root: true});
                            commit('isAuthenticated', {
                                isAuthenticated: true,
                                authProvider: 'auth0'
                            })
                            commit('imagecenter/deleteListData', null, {root: true})
                            resolve()
                        }).catch((error) => {
                        console.log("...failed:", error);
                        commit("loginFailure");
                        reject()
                    })
                }, 1000)
            })
        },


        register({commit, rootState}, {email, password, firstName, lastName}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    //console.log(`Attempt to register ${email}:${password}`);
                    var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('grant_type', rootState.oauth_credentials.grant_type);
                    data.append('scope', rootState.oauth_credentials.scope);
                    data.append('email', email);
                    data.append('password', password);
                    data.append('first_name', firstName);
                    data.append('last_name', lastName);
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
                            commit('updateToken', {
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token
                            }, {root: true});
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

        registerChild({state, commit, rootState}, {email, first_name, last_name, birthday}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    //console.log(`Attempt to register child ${email}`);
                    var data = {
                        'username': uuidv4(),
                        'email': email,
                        'first_name': first_name,
                        'last_name': last_name,
                        'date_of_birth': birthday,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + "users/" + state.user.username + '/' + process.env.VUE_APP_ADDCHILD,
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

        addCaregiversToChild({commit, rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var data = {
                        'child_username': payload.child_username,
                        'caregiver_usernames': payload.caregiver_usernames,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + "users/add_caregivers_to_specific_child/",
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
                            commit('caseroom/setParticipants', response.data, {root: true})
                            resolve(response.data)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },


        deleteChild({state, rootState}, {username}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var data = {
                        'username': username,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + "users/" + state.user.username + '/deletechild/',
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

        registerInvitedUserEmail({rootState}, {first_name, last_name, address, roles, email, b_day}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log(`Attempt to register user ${email}`);
                    var data = {
                        'username': uuidv4(),
                        'first_name': first_name,
                        'last_name': last_name,
                        'postal_address': address,
                        'roles': roles,
                        'email': email,
                        'date_of_birth': b_day,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + process.env.VUE_APP_ADDINVITEDUSER_EMAIL,
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


        registerInvitedUserPDF({rootState}, {first_name, last_name, address, roles, email, b_day}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log(`Attempt to register user ${first_name}`);
                    var data = {
                        'username': uuidv4(),
                        'first_name': first_name,
                        'last_name': last_name,
                        'postal_address': address,
                        'roles': roles,
                        'email': email,
                        'date_of_birth': b_day,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + process.env.VUE_APP_ADDINVITEDUSER_PDF,
                        data: data,
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json',
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },

        registerInvitedUserQRCode({rootState}, {first_name, last_name, address, roles, email, b_day}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log(`Attempt to register user ${first_name}`);
                    var data = {
                        'username': uuidv4(),
                        'first_name': first_name,
                        'last_name': last_name,
                        'postal_address': address,
                        'roles': roles,
                        'email': email,
                        'date_of_birth': b_day,
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + process.env.VUE_APP_ADDINVITEDUSER_QRCODE,
                        data: data,
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        },


        checkEmail({commit}, {username, token}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_ACTIVATION_SUFFIX"] + username + '/',
                    };
                    axios(config)
                        .then((response) => {
                            //console.log('EMail Activation Response: ', response.data)
                            commit("setUser", response.data)
                            commit('updateToken', {access_token: token}, {root: true});
                            commit('isAuthenticated', {
                                isAuthenticated: true,
                                authProvider: 'login'
                            })
                            resolve()
                        }).catch((e) => {
                        commit("loginFailure");
                        console.log('Email Activation Error: ', e)
                        reject()
                    })

                }, 1000)
            })
        },

        emailExists({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var config = {
                        method: 'GET',
                        url: rootState.endpoints.baseUrl + 'emailexists/',
                        params: {email: payload.email}
                    };
                    axios(config)
                        .then((response) => {
                            if (response.data.email == 'OK') {
                                // EMail already exists
                                reject(false)
                            } else {
                                // EMail is not known
                                resolve(true)
                            }
                        })
                }, 1000)
            })
        },

        forgotPasswordEmail({commit}, {email}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('loginRequest');
                    var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_EMAIL"],
                        params: {
                            'email': email
                        }
                    };
                    axios(config).then((response) => {
                        commit("loginPause")
                        commit("setUsernameWhilePasswordForgot", response.data)
                        resolve()
                    }).catch((e) => {
                        commit("loginFailure")
                        console.log('Error while sending eMail request: ', e)
                        reject()
                    })
                }, 1000)
            })
        },

        setPasswordEmail({rootState}, {email}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var config = {
                        method: 'GET',
                        url: rootState.endpoints.baseUrl + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_EMAIL"],
                        params: {
                            'email': email
                        }
                    };
                    axios(config).then((response) => {
                        resolve(response)
                    }).catch((e) => {
                        console.log('Error while sending eMail request: ', e)
                        reject(e)
                    })
                }, 1000)
            })
        },
        setNewPassword({rootState}, {username, token, password}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + 'setnewpassword/',
                        data: {
                            'username': username,
                            'emailtoken': token,
                            'password': password,
                        }
                    };
                    axios(config).then((response) => {
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                }, 1000)
            })
        },


        eMailUser({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_USERACCOUNTS_SUFFIX"] + payload.username + '/email/',
                        data: {
                            'subject': payload.subject,
                            'message': payload.message
                        },
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config).then((response) => {
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                }, 1000)
            })
        },

        forgotPasswordLogin({commit, getters, rootState}, {token, password}) {
            let username = getters.getterUsernameSimple
            //console.log('Try FPL with ', username, token)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (username) {
                        commit('loginRequest');
                        var config = {
                            method: 'POST',

                            url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_OAUTH_PASSWORD_FORGOT_LOGIN"],
                            data: {
                                'username': username,
                                'password': password,
                                'emailtoken': token,
                                'client_id': rootState.oauth_credentials.client_id,
                                'client_secret': rootState.oauth_credentials.client_secret,
                                'grant_type': rootState.oauth_credentials.grant_type,
                                'scope': rootState.oauth_credentials.scope
                            }
                        };
                        axios(config).then((response) => {
                            commit('updateToken', {
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token
                            }, {root: true});
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


        logout({commit, rootState}) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    //vm.$auth.logout();
                    //revoking AccessToken
                    var data = new FormData();
                    data.append('client_id', rootState.oauth_credentials.client_id);
                    data.append('client_secret', rootState.oauth_credentials.client_secret);
                    data.append('token', rootState.token)
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
                    axios(config).finally(() => {
                        commit('imagecenter/deleteListData', null, {root: true})
                        commit('caseroom/resetUserCaseRooms', null, {root: true})
                        commit("logout");
                        resolve()
                    })

                }, 1000)
            })
        },

        getLoginStatus({state}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (state.status == STATUS.success) {
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
                            url: rootState.endpoints.baseUrl + "users/" + state.user.username + '/',
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
                            commit('setUser', response.data)
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

        updateAccountDetails({state, commit, rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (state.user) {
                        const config = {
                            url: rootState.endpoints.baseUrl + "users/" + state.user.username + '/',
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
                            commit('setUser', response.data)
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

        updateAccountDetailsOtherUser({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.baseUrl + "users/" + payload.username + '/',
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
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                }, 1000)
            })
        },


        toggleUserActivation({state, rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (state.user) {
                        let user2del;
                        if (payload) user2del = payload.username
                        else user2del = state.user.username
                        const config = {
                            url: rootState.endpoints.baseUrl + "users/" + user2del + '/toggleUserActivation/',
                            method: 'POST',
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
        },

        getDevices({commit, rootState}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var config = {
                        method: 'GET',
                        url: rootState.endpoints.baseUrl + "device/",
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config)
                        .then((response) => {
                            commit('setDeviceList', response.data, {root: true})
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })

                }, 1000)
            })
        },

        addDevice({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var data = {
                        uuid: payload.device_id,
                        type: payload.device_descriptor
                    }
                    var config = {
                        method: 'POST',
                        url: rootState.endpoints.baseUrl + "device/",
                        data: data,
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })

                }, 1000)
            })
        },
        removeDevice({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    var id = payload.id
                    var config = {
                        method: 'DELETE',
                        url: rootState.endpoints.baseUrl + "device/" + id + '/',
                        headers: {
                            authorization: `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    };
                    axios(config)
                        .then((response) => {
                            resolve(response)
                        }).catch((error) => {
                        reject(error)
                    })

                }, 1000)
            })
        },
    },
    mutations,
};
