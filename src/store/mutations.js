import Vue from 'vue'
import * as axios from "axios";

function _setEntryData(state, { id, title, status, img, modimg, fdata }) {
    Vue.set(state.entries, id, {'title':title, 'status':status, 'img':img, 'modimg':modimg, 'fdata':fdata});
}

export default {
    /**
    *
    * @param { Vuexmod1State } state
    * @param { string } vedata
    */
    setAuth(state, {auth}){
        state.isAuthenticated=auth;
    },

    setEntryData(state, { id, title, status, img, modimg, fdata }) {
         _setEntryData(state, { id, title, status, img, modimg, fdata });
    },


    appendEntryKey(state, {id}) {
        state.selectEntriesKeys.push(id);
    },

    deleteEntryKeys(state) {
        state.selectEntriesKeys = [];
    },

    setListData(state, { entries}) {
        entries.forEach(entry => {
            console.log(entry.id)
            _setEntryData(state, {id: entry.id,
                title: entry.title,
                status: entry.status,
                img: entry.img,
                modimg: entry.modified_img,
                fdata: entry.formatted_data});
        })
    },

    setAuthUser(state, {authUser, isAuthenticated}) {
      Vue.set(state, 'authUser', authUser)
      Vue.set(state, 'isAuthenticated', isAuthenticated)
    },

    updateToken(state, newToken) {
      // TODO: For security purposes, take localStorage out of the project.
      localStorage.setItem('token', newToken);
      state.token = newToken;
    },
    removeToken(state) {
      // TODO: For security purposes, take localStorage out of the project.
      localStorage.removeItem('token');
      state.token = null;
    },

    SOCKET_ONOPEN (state, event)  {
      Vue.prototype.$socket = event.currentTarget
      state.socket.isConnected = true
        console.log('Socket open');
    },
    SOCKET_ONCLOSE (state)  {
      state.socket.isConnected = false
        console.log('Socket closed');
    },
    SOCKET_ONERROR (state,e)  {
      state.socket.isConnected = false
        console.log('Socket error: ',e);
    },
    SOCKET_ONMESSAGE (state, message)  {
      state.socket.message = message
        const status = message.message.status;
        const id = message.message.ssm_id;
        if (status) {
            if (Object.prototype.hasOwnProperty.call(state.entries, id)) {
                Vue.set(state.entries[id], 'status', status)
                      if (status.includes('finish')) {
                            const axiosInstance = axios.create(state.axiosBase)
                            axiosInstance({
                                url: state.endpoints.splineAppUrl + id + '/',
                                method: "get",
                                params: {}
                            })
                                .then((response) => {
                                    const data = response.data
                                    console.log(data.modified_img)
                                    _setEntryData(state, {id: id,
                                        title: data.title,
                                        status: status,
                                        img: data.img,
                                        modimg: data.modified_img,
                                        fdata: data.formatted_data});

                                })
                        }

                }
        }
    },


};
