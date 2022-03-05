import {convertUTCTime} from "@/store/modules/caseroom";
import axios from "axios";
import JSON5 from 'json5'


const actions = {
    SOCKET_ONCASEROOM_MSG({state, commit, dispatch, rootGetters}, message) {
        const msgids = rootGetters['caseroom/getCurrentCrMsgIds'];
        const currCrId = rootGetters['caseroom/getCurrentCrId'];
        const user = rootGetters['auth/getterUsernameSimple'];
        if (currCrId != message.message.caseroom){
            //console.log('Current Cr ID is not message caseroom')
            commit('caseroom/addNewsToCr', {
                id: message.message.caseroom,
                user: user,
                created: message.message.caseroom_entry_created,
                sender: message.message.caseroom_sender,
                text: message.message.caseroom_entry_text}, {root:true})

        }
        if ((state.socket.message.id == message.message.id) || msgids.includes(message.message.id) || (currCrId != message.message.caseroom)) {
         //   console.log('Msg Id already exists or specific Caseroom not open')
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
              //   console.log('CaseRoom Message ', message.message.id, ' failed due to ', e)
            })
        }

        if ((message.message.caseroom_entry_text).includes('$ACTION')) {
            console.log('ACTION MESSAGE RECEIVED')
            commit('messagehub/addMessage', {'message_type':'CASEROOM_NEEDS_CONSENT', ...message.message})
        }
    },

    SOCKET_ONCASEROOM_CHANGED({commit,dispatch},message) {
        console.log('Caseroom changed: ',message)
        dispatch('caseroom/loadUserCaseRooms').then((result) => {
                    const ms = result.data.map(o => o.members);
                    const os = result.data.map(o => o.owner);
                    const unique_ms = [...new Set(ms.flat(1).concat(os.flat(1)))]
                    dispatch('auth/getMinimalUserProfiles', {'usernames':unique_ms})
                    .then((result)=> {
                        commit('caseroom/setParticipants',result)
                        dispatch('auth/getMyPatients')
                    })
                    //this.$store.commit('caseroom/setUserCaseRooms',result.data)
                })
                .catch((e) => {
                    console.log(e)
                })

    },

    SOCKET_ONCASEROOM_WATCHED({commit, rootGetters}, message) {
        const currCrId = rootGetters['caseroom/getCurrentCrId'];
        if (currCrId == message.message.caseroom) {
            commit('caseroom/deleteNewsFromCr', {id: message.message.caseroom, user: message.message.caseroom_sender}, {root:true})
        }
    },


    SOCKET_ONUSERQR_LOGGED_IN({commit}, message) {
        console.log('Invited User Logged in: ',message)
        commit('auth/setInvitedUserLoggedIn',{username: message.message.logged_in_user, user_fullname: message.message.logged_in_user_fullname}, {root:true})
    },

    SOCKET_ONUSERQR_DENIED_LOGIN({commit}, message) {
        console.log('Invited User denied Login: ',message)
        commit('auth/setInvitedUserLoggedIn',{username: 'DENIED', user_fullname: message.message.invited_user_fullname}, {root:true})
        commit('messagehub/setSnackBarMessage',{type:'info',text:'Der eingeladene Benutzer '+message.message.invited_user_fullname+' hat deine Einladung abgelehnt. Der Benutzer wurde wieder gelöscht.'},{root:true})
    },

    SOCKET_ONMLMODEL_MESSAGE({commit}, message) {
            commit('mlmodel/pushMLTerminalMsg',message.message)
    },

    SOCKET_ONMLMODEL_RESULT({commit}, message) {
            commit('mlmodel/pushMLTerminalResult',message.message)
    },

    SOCKET_ONSSMMESSAGE({commit,dispatch},message) {
        const status = message.message.status;
        if ((status=='pending') || (status=='deleted')){
            dispatch('imagecenter/getssm_user_list')
        } else {
            const id = message.message.ssm_id;
            if (message.message.locked)
                commit('imagecenter/setStatus', {'id': id, 'status': status, 'status_dict': message.message.status_dict!="None" ? JSON5.parse(message.message.status_dict) : null,
                'locked':message.message.locked,
                'type': message.message.type,
                'created': message.message.created,
                'formatted_data':message.message.formatted_data!="None" ? JSON5.parse(message.message.formatted_data) : null})
            else
                dispatch('imagecenter/getssm_by_id',{id:id})

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
