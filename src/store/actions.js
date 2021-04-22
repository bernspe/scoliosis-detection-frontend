import {convertUTCTime} from "@/store/modules/caseroom";
import axios from "axios";

const actions = {
    SOCKET_ONCASEROOM_MSG({state, commit, dispatch, rootGetters}, message) {
        const msgids = rootGetters['caseroom/getCurrentCrMsgIds'];
        const currCrId = rootGetters['caseroom/getCurrentCrId'];
        const user = rootGetters['auth/getterUsernameSimple'];
        if (currCrId != message.message.caseroom){
            //console.log('Current Cr ID is not message caseroom')
            commit('caseroom/addNewsToCr', {id: message.message.caseroom, user: user}, {root:true})
        }
        if ((state.socket.message.id == message.message.id) || msgids.includes(message.message.id) || (currCrId != message.message.caseroom)) {
            //console.log('Msg Id already exists or specific Caseroom not open')
        } else {
            state.socket.message = message.message;
            dispatch('caseroom/retrieveCrMsg', message.message.id, {root: true}).then((response) => {
                var new_entry=convertUTCTime(response)
                commit('caseroom/addCrMsg', new_entry, {root: true});
                commit('caseroom/addNewsToMemberTagsCurrentCr', {'id':message.message.caseroom,
                                                                'members':message.message.caseroom_participants,
                                                                'user':user}, {root: true});
                commit('caseroom/deleteNewsFromCr', {id: message.message.caseroom, user: message.message.caseroom_sender}, {root:true});
            }).catch(() => {
                // console.log('CaseRoom Message ', message.message.id, ' failed due to ', e)
            })
        }
    },

    SOCKET_ONCASEROOM_WATCHED({commit, rootGetters}, message) {
        const currCrId = rootGetters['caseroom/getCurrentCrId'];
        if (currCrId == message.message.caseroom) {
            commit('caseroom/deleteNewsFromCr', {id: message.message.caseroom, user: message.message.caseroom_sender}, {root:true})
        }
    },


    getBackEndVersion({state,commit}) {
        return new Promise((resolve, reject) => {
        const config = {
                  url: state.endpoints.baseUrl+"version/",
                method: 'GET',
              }
                  axios(config)
                      .then((response) => {
                      commit('setBackEndVersion', {version: response.data}, {root:true})
                          resolve()
                  }).catch((e) => {
                      console.log('Version retrieval failed: ',e)
                      reject()
                  })
            }, 1000)

    },
}

export default actions
