import axios from "axios";
import Vue from 'vue'
import {mean, round, std} from 'mathjs'

const state = () => ({
    entries: null,
    collection_entries: {},
    collections: null,
    PROCESS_STATUS_LABELS: ['UPLOADED', 'CROP_LEVEL1', 'CLASSIFY_LEVEL1', 'CLASSIFY_LEVEL2', 'MEASURE_LEVEL1', 'MEASURE_LEVEL2', 'MEASURE_LEVEL3', 'PROTECTING', 'PROTECTED'],
    PROCESS_TYPE_LABELS: [{text: 'Röntgenbild a.p.', value: 'process_xray_cobb'}, {
        text: 'Rückenfoto aufrecht stehend',
        value: 'process_upright'
    }, {text: 'Rückenfoto nach vorn gebeugt', value: 'process_bendforward'}, {
        text: 'Bild verwerfen',
        value: 'discarded'
    }],
    TYPE_DEP_LABEL_INSTRUCTION: {
        'dummy': '',
        'process_xray_cobb': 'Markiere alle Wirbel mittig und benenne den obersten und untersten Wirbel',
        'process_upright': 'Setze Punkte auf die Taillenlinie und beginne dabei in der Achselfalte',
        'process_bendforward': 'Markiere die höchste Erhebung des Rumpfes auf jeder Seite',
        'discarded': '',
    },
    VERTEBRAE_LABELS: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1', 'L2', 'L3', 'L4', 'L5', 'S1'],
    DIAGNOSIS_LABELS_DE: [{value: 'NC', text: 'Keine Skoliose (klinisch)'},
        {value: 'NR', text: 'Keine Skoliose (radiologisch bestätigt)'},
        {value: 'SC', text: 'Skoliose (klinisch)'},
        {value: 'SR', text: 'Skoliose (radiologisch bestätigt)'},
        {value: 'U', text: 'Unklarer Befund'},
        {value: 'P', text: 'Skoliose, postoperativ'},
        {value: 'B', text: 'Skoliose unter Korsettbehandlung'}],
    camera_pictures: [],
    current_camera_pic:null,
})

const getters = {
    getterAllEntries: (state) => {
        return state.entries;
    },
    getterAllEntriesAsArray: (state) => {
        let a = null
        a = Object.keys(state.entries ? state.entries : {}).map(id => {
            return {
                'id': id,
                ...state.entries[id],
            }
        })
        return a
    },

    getterAllEntriesWOResult: (state) => {
        let a = null
        a = Object.keys(state.entries ? state.entries : {}).map(id => {
            return {
                'id': id,
                ...state.entries[id],
            }
        })
        return a.filter((x) => {
            return ((x.hasResult === '') || (x.hasResult === null) || (x.hasResult === undefined))
        })
    },

    getterAllCollectionEntries: (state) => {
        return state.collection_entries;
    },
    getterCollections: (state) => {
        return state.collections;
    },
    getterNumericStatus: (state) => (status) => {
        let a = state.PROCESS_STATUS_LABELS
        return Math.round((a.indexOf(status) + 1) * 100 / 7)
    },

    getterStatusLabels: (state) => {
        return state.PROCESS_STATUS_LABELS
    },

    getterTypeLabels: (state) => {
        return state.PROCESS_TYPE_LABELS
    },

    getterSSMType: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            return e.type
        }
    },
    getterSSMImg: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            return e.img
        }
    },
    getterSSMProtected: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            return (e.status == 'PROTECTED')
        }
    },

    getterSquaredDistances: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            let res = e.formatted_data.MEASURE_LEVEL2_result.SquaredDistances
            return {'mean': round(mean(res), 2), 'std': round(std(res), 2)}
        }

    },

    getterAdamsAngle: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            return round(e.formatted_data.MEASURE_LEVEL2_result.Humpangle, 0)
        }
    },
    getterCOBBAngles: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
            let e = state.entries[id]
            return {
                'COBB_vertebrae': e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae,
                'COBB_angles': e.formatted_data.MEASURE_LEVEL2_result.COBB_angles,
                'val_COBB_vertebrae': e.formatted_data.MEASURE_LEVEL2_result.val_COBB_vertebrae,
                'val_COBB_angles': e.formatted_data.MEASURE_LEVEL2_result.val_COBB_angles,
                'zip_COBB': e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae.map((k, i) => [k[0] + ' - ' + k[1] + ': ', e.formatted_data.MEASURE_LEVEL2_result.COBB_angles[i]])
            }

        }
    },

    getterCollectionSquaredDistances: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.collections, id)) {
            let e = state.collections[id]
            let result = []
            let counter = 0
            let ids = []
            e.formatted_data.type.forEach((x, index) => {
                if (x == 'process_upright') {
                    result.push(...e.formatted_data.result[index])
                    counter += e.formatted_data.result[index].length
                    ids.push(e.formatted_data.id[index])
                }
            })
            if (result.length > 0) {
                return {'mean': round(mean(result), 2), 'std': round(std(result), 2), 'count': counter, 'ids': ids}
            } else {
                return null
            }

        }
    },

    getterCollectionAdamsAngle: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.collections, id)) {
            let e = state.collections[id]
            let result = []
            let counter = 0
            let ids = []
            e.formatted_data.type.forEach((x, index) => {
                if (x == 'process_bendforward') {
                    result.push(e.formatted_data.result[index])
                    counter += 1
                    ids.push(e.formatted_data.id[index])
                }
            })
            if (result.length > 0) {
                return {'mean': round(mean(result), 2), 'std': round(std(result), 2), 'count': counter, 'ids': ids}
            } else {
                return null
            }
        }
    },
    getterCollectionCOBBAngles: (state) => (id) => {
        if (Object.prototype.hasOwnProperty.call(state.collections, id)) {
            let e = state.collections[id]
            let result = []
            let counter = 0
            let ids = []
            e.formatted_data.type.forEach((x, index) => {
                if (x == 'process_xray_cobb') {
                    let r = e.formatted_data.result[index]
                    result.push(r.COBB_vertebrae.map((k, i) => [k[0] + ' - ' + k[1] + ': ', r.COBB_angles[i]]))
                    counter += 1
                    ids.push(e.formatted_data.id[index])
                }
            })
            return {'result': result, 'count': counter, 'ids': ids}

        }
    },

    getterCameraPictures: (state) => {
        return state.camera_pictures;
    },

    getterCurrentCameraPicture: (state) => {
        return state.current_camera_pic
    }

}

const mutations = {

    setListData(state, payload) {
        let ta = payload.entries.map((x) => ([
            x.id, {
                'title': x.title,
                'owner_username': x.owner,
                'owner_fullname': x.owner_fullname,
                'owner_birthday': x.owner_birthday,
                'locked': x.locked,
                'created': x.created,
                'type': x.type,
                'status': x.status,
                'status_dict': x.status_dict,
                'img': x.img,
                'thumb_img': x.thumb_img,
                'resized_img': (x.status == 'PROTECTED') ? x.protected_resized_img : x.resized_img,
                'modified_img': (x.status == 'PROTECTED') ? x.protected_modified_img : x.modified_img,
                'man_labeled_img': (x.status == 'PROTECTED') ? x.protected_man_labeled_img : x.man_labeled_img,
                'formatted_data': x.formatted_data,
                'hasResult': x.formatted_data ? Object.keys(x.formatted_data).reverse().find(x => {
                    var s = x.match(/\W*(MEASURE_LEVEL)\d\W*(_result)/g)
                    return s ? s.toString() : null
                }) : null
            }]));
        if (Object.prototype.hasOwnProperty.call(payload, 'target')) {
            payload.target = Object.assign(payload.target, Object.fromEntries(ta))
        } else {
            state.entries = Object.fromEntries(ta)
        }

    },
    deleteListData(state) {
        state.entries = null;
        state.collection_entries = {};
    },

    removeListItem(state, payload) {
        delete state.entries[payload.id]
    },

    setStatus(state, payload) {
        if (state.entries) {
            const id = payload['id']
            const status = payload['status']
            if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
                Vue.set(state.entries[id], 'status', status)
                Vue.set(state.entries[id], 'status_dict', payload['status_dict'])
                Vue.set(state.entries[id], 'locked', payload['locked'])
                Vue.set(state.entries[id], 'type', payload['type'])
                Vue.set(state.entries[id], 'created', payload['created'])
                Vue.set(state.entries[id], 'formatted_data', payload['formatted_data'])
            }
        }
    },

    updateEntry(state, payload) {
        if (state.entries) {
            const id = payload['id']
            if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
                const np = payload
                const oldEntry = state.entries[id]
                delete np.id
                var newEntry = Object.assign(oldEntry, np)
                const add_params = {
                    'resized_img': (newEntry.status == 'PROTECTED') ? newEntry.protected_resized_img : newEntry.resized_img,
                    'modified_img': (newEntry.status == 'PROTECTED') ? newEntry.protected_modified_img : newEntry.modified_img,
                    'man_labeled_img': (newEntry.status == 'PROTECTED') ? newEntry.protected_man_labeled_img : newEntry.man_labeled_img,
                    'formatted_data': newEntry.formatted_data,
                    'hasResult': newEntry.formatted_data ? Object.keys(newEntry.formatted_data).reverse().find(x => {
                        var s = x.match(/\W*(MEASURE_LEVEL)\d\W*(_result)/g)
                        return s ? s.toString() : null
                    }) : null,
                    'status': newEntry.status,
                    'status_dict': newEntry.status_dict
                }
                var newEntry2 = Object.assign(newEntry, add_params)
                Vue.set(state.entries, id, newEntry2)

            }
        }
    },

    setCollectionListData(state, payload) {
        let ta = payload.entries.map((x) => ([
            x.id, {
                'owner_username': x.owner,
                'owner_fullname': x.owner_fullname,
                'owner_birthday': x.owner_birthday,
                'created': x.created,
                'ssm_items': x.items,
                'diagnoses': x.diagnoses,
                'formatted_data': x.formatted_data
            }]));
        state.collections = Object.fromEntries(ta)
    },

    updateCollectionListData(state, payload) {
        if (state.collections) {
            const id = payload['id']
            if (Object.prototype.hasOwnProperty.call(state.collections, id)) {
                const np = payload
                delete np.id
                Object.keys(np).forEach((x) => {
                    Vue.set(state.collections[id], x, np[x])
                })
            }
        }
    },

    setCameraPicture(state, payload) {
        Vue.set(state.camera_pictures, state.current_camera_pic, payload)
    },

    setCurrentCameraPicture(state,payload) {
        state.current_camera_pic=payload
    },
       clearAllCameraPictures(state) {
        state.current_camera_pic=null
           state.camera_pictures=[]
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: {
        getssm_user_list({rootState, commit}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.splineAppUrl,
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
                            const data = response.data
                            commit('setListData', {entries: data});
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },
        getssm_id_list({state, rootState, commit}, payload) {
            // returns a list of ssms through a given list of ssm ids
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const ids = payload.ids
                    const config = {
                        url: rootState.endpoints.splineAppUrl + 'get_ssm_by_idlist/',
                        method: 'POST',
                        headers: {
                            'authorization': `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        data: ids,
                        xhrFields: {
                            withCredentials: true
                        },

                    }
                    axios(config)
                        .then((response) => {
                            const data = response.data
                            commit('setListData', {entries: data, target: state.collection_entries});
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },
        getssm_by_id({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.splineAppUrl + payload.id + '/',
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
                            const data = response.data
                            commit('updateEntry', data);
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },
        submitNewSSM({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'],
                        method: 'POST',
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
                        commit('updateEntry', response.data)
                        resolve(response)
                    }).catch((e) => {
                        reject(e)
                    })
                }, 1000)
            })
        },


        validateSSM({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? payload.id ? true : false : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/measure_level3/',
                            method: 'GET',
                            headers: {
                                authorization: `Bearer ${rootState.token}`,
                                'Content-Type': 'application/json'
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                        }
                        axios(config).then((response) => {
                            commit('setStatus', {'id': payload.id, 'status': 'MEASURE_LEVEL3'})
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Validate SSM: No id given')
                    }
                }, 1000)
            })
        },

        protectSSM({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? payload.id ? true : false : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/protect/',
                            method: 'GET',
                            headers: {
                                authorization: `Bearer ${rootState.token}`,
                                'Content-Type': 'application/json'
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                        }
                        axios(config).then((response) => {
                            commit('setStatus', {'id': payload.id, 'status': 'PROTECTED'})
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Protect SSM: No id given')
                    }
                }, 1000)
            })
        },

        updateSSM({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? payload.id ? true : false : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/',
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
                            commit('updateEntry', response.data)
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Update SSM: No id given')
                    }
                }, 1000)
            })
        },

        classify_level2({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? !!payload.id : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/classify_level2/',
                            method: 'POST',
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
                            commit('updateEntry', response.data)
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Update SSM: No id given')
                    }
                }, 1000)
            })
        },

        measure_level2({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? !!payload.id : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/measure_level2/',
                            method: 'POST',
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
                            //commit('updateEntry',response.data)
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Update SSM: No id given')
                    }
                }, 1000)
            })
        },


        deleteSSM({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? payload.id ? true : false : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/',
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
                            commit('removeListItem', {id: payload.id})
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Delete SSM: No id given')
                    }
                }, 1000)
            })
        },

        get_gviz_data_for_ssms({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.splineAppUrl + 'get_ssm_jsondata/',
                        method: 'GET',
                        headers: {
                            'authorization': `Bearer ${rootState.token}`,
                            'Content-Type': 'application/json'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        params: payload
                    }
                    axios(config)
                        .then((response) => {
                            const data = response.data
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },


        addSSMtoCollection({rootState}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (payload ? payload.id ? true : false : false) {
                        const config = {
                            url: rootState.endpoints.baseUrl + process.env['VUE_APP_SPLINEAPP_SUFFIX'] + payload.id + '/add_to_collection/',
                            method: 'GET',
                            headers: {
                                authorization: `Bearer ${rootState.token}`,
                                'Content-Type': 'application/json'
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                        }
                        axios(config).then((response) => {
                            console.log(response)
                            resolve(response)
                        }).catch((e) => {
                            reject(e)
                        })
                    } else {
                        reject('Add SSM To Collection: No id given')
                    }
                }, 1000)
            })
        },

        getcollection_user_list({rootState, commit}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.collectionUrl,
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
                            const data = response.data
                            commit('setCollectionListData', {entries: data});
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },

        add_diagnosis_to_collection({rootState, commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const config = {
                        url: rootState.endpoints.collectionUrl + payload.id + '/adddiagnosis/',
                        method: 'GET',
                        params: {diagnosis: payload.diagnosis},
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
                            const data = response.data
                            commit('updateCollectionListData', data)
                            resolve(data)
                        }).catch((e) => {
                        console.log(e)
                        reject(e)
                    })
                }, 1000)
            })
        },

    }
}