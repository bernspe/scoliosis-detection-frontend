import Vue from 'vue'
import * as axios from "axios";

function _setEntryData(state, { id, title, status, img, modimg, formatted_data }) {
    Vue.set(state.entries, id, {'title':title, 'status':status, 'img':img, 'modimg':modimg, 'formatted_data':formatted_data});
}

function getDeviceType(ua){
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
      }
      if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
      }
      return "desktop";
    }

export default {
    /**
    *
    * @param { Vuexmod1State } state
    * @param { string } vedata
    */
    setBackEndVersion(state, payload){
      state.versions.backend=payload.version.version
        state.versions.backend_date=payload.version.date
    },

    setDeviceID(state,payload){
      state.device.device_id=payload
    },

    setDeviceMobile(state, payload) {
      state.device=payload
    },

    setDeviceList(state, payload){
        var cur_dev_in_list = payload.map((x)=> { return x.uuid === state.device.device_id ? x.id : null}).filter(x=>x!=null)
        Vue.set(state.device, 'isInList',cur_dev_in_list.length>0)

        state.other_devices=payload.map((x)=> {
            return {
                id: x.id,
                device_id: x.uuid,
                device_descriptor: x.type,
                created: x.created,
                device_type: getDeviceType(x.type),
                isMobile: getDeviceType(x.type) === 'mobile',
                isCurrentDevice: state.device.device_id===x.uuid,
            }
        })
    },

    setEntryData(state, { id, title, status, img, modimg, formatted_data }) {
         _setEntryData(state, { id, title, status, img, modimg, formatted_data: formatted_data });
    },


    appendEntryKey(state, {id}) {
        state.selectEntriesKeys.push(id);
    },

    deleteEntryKeys(state) {
        state.selectEntriesKeys = [];
    },


    updateToken(state, payload) {
      // TODO: For security purposes, take localStorage out of the project.
      localStorage.setItem('token', payload.access_token);
      if (Object.prototype.hasOwnProperty.call(payload,'refresh_token')) {
          localStorage.setItem('refr', payload.refresh_token);
      }
      state.token = payload.access_token;
    },
    removeToken(state) {
      // TODO: For security purposes, take localStorage out of the project.
      localStorage.removeItem('token');
      if (!state.isMobile){
          localStorage.removeItem('refr');
      }
      state.token = null;
    },

    toggleInformationSwitch(state) {
        state.informationSwitch = !state.informationSwitch
    },

    SOCKET_ONOPEN (state, event)  {
      Vue.prototype.$socket = event.currentTarget
      state.socket.isConnected = true
        console.log('Socket open');
          },

    SOCKET_ONCLOSE (state)  {
      state.socket.isConnected = false
        console.log('Socket closed');
      state.messagehub.snackbar_message='WebSocket closed'
        state.messagehub.snackbar_message_type='info'
    },

    SOCKET_ONERROR (state,e)  {
      state.socket.isConnected = false
        console.log('Socket error: ',e);
      state.messagehub.snackbar_message='WebSocket Error: '+e
        state.messagehub.snackbar_message_type='error'
    },

    // mutations for reconnect methods
    SOCKET_RECONNECT(state, count) {
      console.info('Reconnecting Websocket. ',state, count)
        state.messagehub.snackbar_message='WebSocket reconnecting. Count: '+count
        state.messagehub.snackbar_message_type='info'
    },
    SOCKET_RECONNECT_ERROR(state) {
      console.log('Reconnect error')
        state.socket.reconnectError = true;
        state.messagehub.snackbar_message='WebSocket Reconnect Error.'
        state.messagehub.snackbar_message_type='error'
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
                                        formatted_data: data.formatted_data});

                                })
                        }

                }
        }
    },




};
