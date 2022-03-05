import axios from "axios";
import {DateTime} from "luxon";
import Vue from 'vue';

const state = () => ({
    UserCaseRooms: {},
    helpdeskIds:[],
    CrParticipantsData: {},
    CurrentCrMsgs:[],
    CurrentCrId:null,
});

function convertdt(dt) {
    const dtc=DateTime.fromISO(dt)
    return dtc.toLocaleString(DateTime.DATETIME_MED)
}

function arrayRemove(arr, value) {
         return arr.filter(function(ele){
            return ele != value;
        });
    }

export function convertUTCTime(crentry) {
    crentry.created = DateTime.fromISO(crentry.created);
    crentry.created_day = crentry.created.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    crentry.created_time = crentry.created.toLocaleString(DateTime.TIME_SIMPLE)
    return crentry
}

// getters
const getters = {
    getUserCaseRooms: (state) => {
      return state.UserCaseRooms;
    },

    getUserCaseRoomsAsArray: (state, getters, rootState)=> {
        let a=null
        a = Object.keys(state.UserCaseRooms ? state.UserCaseRooms : {}).map(id => {
            if (!(state.helpdeskIds.includes(id)))
                return {
                   'id': id,
                    'owner_fullname': state.CrParticipantsData[state.UserCaseRooms[id].owner].first_name + ' ' + state.CrParticipantsData[state.UserCaseRooms[id].owner].last_name,
                    'members_fullname': state.UserCaseRooms[id].members.map((x) => state.CrParticipantsData[x].first_name + ' ' + state.CrParticipantsData[x].last_name),
                    'has_news_for_current_user': rootState.auth.user ? state.UserCaseRooms[id].news_for_participants.includes(rootState.auth.user.username) : false,
                       ...state.UserCaseRooms[id]
                }
        })
        return a.filter(n => n)
    },

   getHelpDeskCaseRoomsAsArray: (state)=> {
        let a=null
        a = Object.keys(state.UserCaseRooms ? state.UserCaseRooms : {}).map(id => {
            if (state.helpdeskIds.includes(id))
                return {
                   'id': id,
                    'owner_fullname': state.CrParticipantsData[state.UserCaseRooms[id].owner].first_name + ' ' + state.CrParticipantsData[state.UserCaseRooms[id].owner].last_name,
                    'members_fullname': state.UserCaseRooms[id].members.length>0 ? state.UserCaseRooms[id].members.map((x) => state.CrParticipantsData[x].first_name + ' ' + state.CrParticipantsData[x].last_name) : '',
                    'has_news_for_current_user': state.UserCaseRooms[id].lastmsg ? state.UserCaseRooms[id].lastmsg.sender ===  state.UserCaseRooms[id].owner : false,
                       ...state.UserCaseRooms[id]
                }
        })
        return a.filter(n => n)
    },

    getHelpDeskCaseRoom: (state) => {
        var ucr=state.UserCaseRooms
        var cr = Object.entries(ucr).filter((x) => x[1].title.includes('Helpdesk'))
        if (cr.length>0) {
            return {id: cr[0][0], caseroom: cr[0][1]}
        } else {
            return null
        }

      },
    getCurrentCrMsgs: (state) => {
      return state.CurrentCrMsgs;
    },
    getCurrentCrMsgIds: (state) => {
        return state.CurrentCrMsgs.map((x) => x.id);
    },
    getCurrentCrId: (state)=> {
      return state.CurrentCrId;
    },
    getCurrentCr: (state) => {
        return state.UserCaseRooms[state.CurrentCrId];
    },
    getCurrentCrMemberStatus: (state)=> (username) =>{
        let cr=state.UserCaseRooms[state.CurrentCrId];
                let memberList=[]
                if (cr) {
                    [...cr.members,cr.owner].forEach((m)=> {
                        let a;
                        cr.news_for_participants.includes(m) ? a={'name':m,'watched':false} : a={'name':m,'watched':true}
                        if (m!=username) {
                            memberList.push(a)
                        }
                    })                }
                return memberList

    },

    getLastMsg: (state) => (cr) => {
        return state.UserCaseRooms[cr].lastmsg
    },
   hasSSM: (state) => (cr) => {
        if (cr) {
            return Object.hasOwnProperty.call(state.UserCaseRooms,cr) ? state.UserCaseRooms[cr].hasssm : null
        }
    },
    getParticipantsChildrenNAdultsNPatients: (state) => {
        if (state.CrParticipantsData) {
            const subarray = Object.entries(state.CrParticipantsData)
            let subObj = subarray.filter((x) => (x[1].roles.includes('Child') | x[1].roles.includes('Adult') | x[1].roles.includes('Patient')))
            return Object.fromEntries(subObj)
        }
    },
    getParticipant: (state) => (username) => {
        return state.CrParticipantsData[username];
    },
    getParticipantFullname: (state) => (username) => {
        let result=null;
        if ((username!=null) && (state.CrParticipantsData)){
            if (username in state.CrParticipantsData) {
                    result=state.CrParticipantsData[username].first_name + ' ' + state.CrParticipantsData[username].last_name;
            }
        }
        return result
    },
    getParticipantRole: (state) => (username) => {
        let result=null;
        if ((username.length>0) && (state.CrParticipantsData)){
            if (username in state.CrParticipantsData) {
                result=state.CrParticipantsData[username].roles;
            }
        }
        return result
    },

    getParticipantRole_DE: (state, getters, rootState) => (username) => {
        let result=null;
        if ((username!=null) && (state.CrParticipantsData)){
            if (username in state.CrParticipantsData) {
                result=state.CrParticipantsData[username].roles ? state.CrParticipantsData[username].roles.map((x)=> rootState.auth.userroles[x]).join() : '';
            }
        }
        return result
    },
   getParticipantDocument: (state) => (username) => {
        let result=null;
        if ((username.length>0) && (state.CrParticipantsData)){
            if (username in state.CrParticipantsData) {
                result=state.CrParticipantsData[username].document_url;
            }
        }
        return result
    },

};



const mutations = {
    addNewsToCr(state,payload) {
        //tags the news flag to the Caserooms of the current user
        if (state.UserCaseRooms) {
            const crBackup=state.UserCaseRooms[payload.id]
            const currnews=state.UserCaseRooms[payload.id].news_for_participants
            const lastmsg={
                'created': payload.created,
                'sender':payload.sender,
                'text': payload.text
            }
            if (!currnews.includes(payload.user)) {
                currnews.push(payload.user)
            }
            Vue.set(state.UserCaseRooms,payload.id, Object.assign(crBackup,{news_for_participants: currnews, lastmsg: lastmsg}))
        }
    },

    addNewsToMemberTagsCurrentCr(state,payload) {
        //adds the news tag to all members of current caseroom, but not to the current user
        if (state.UserCaseRooms) {
            const user=payload.user
            const membersArray=payload.members.split(',')
            const members = membersArray.filter(e => e !== user) // exclude the current user
            const lastmsg = state.UserCaseRooms[payload.id].lastmsg
            const crBackup=state.UserCaseRooms[payload.id]
            let currnews=state.UserCaseRooms[payload.id].news_for_participants
            members.forEach((m)=> {
                if (!currnews.includes(m)) {
                    currnews.push(m)
                }
            })
            Vue.set(state.UserCaseRooms,payload.id, Object.assign(crBackup,{news_for_participants: currnews, lastmsg: lastmsg}))
        }
    },
    deleteNewsFromCr(state,payload) {  //removes the news tag from the specified user - caseroom combination
        if (state.UserCaseRooms) {
            const a=state.UserCaseRooms[payload.id].news_for_participants
            if (a.includes(payload.user)){
                const b=arrayRemove(a, payload.user);
                state.UserCaseRooms[payload.id].news_for_participants=b
            }
        }
    },
    setUserCaseRooms(state,payload) {
        let reset;
        let ucr;
        if (Object.prototype.hasOwnProperty.call(payload,'resetUserCaseRooms')) {
            reset = payload.resetUserCaseRooms
        } else
        {
            reset = false
        }
        if (Object.prototype.hasOwnProperty.call(payload,'caserooms')) {
            ucr = payload.caserooms
        } else {
            ucr = payload
        }
        var backup = Object.assign({},  reset ? {} : state.UserCaseRooms)
        state.UserCaseRooms=Object.assign(backup, ...ucr.map((x) => ({
            [x.id]: {'created': convertdt(x.created),
                'expires':convertdt(x.expires),
                'owner': x.owner,
                'members':x.members,
                'members_without_msg': x.members_without_msg,
                'news_for_participants': x.news_for_participants,
                'title':x.title,
                'lastmsg': x.lastmsg,
                'hasssm':x.hasssm}})));
    },

    setHelpDeskIds(state, payload) {
       state.helpdeskIds=payload.map((x) => x.id)
    },

    resetUserCaseRooms(state) {
       state.UserCaseRooms = {}
       state.helpdeskIds=[]
    },

    setParticipants(state,payload){
        const arr = Object.assign({}, ...payload.map((x) => ({[x.username]: {'first_name': x.first_name, 'last_name':x.last_name, 'roles': x.roles, 'document_url':x.document}})));
        Object.keys(arr).forEach((x) => Vue.set(state.CrParticipantsData, x, arr[x]))
    },
    addParticipant(state,payload) {
        payload.forEach((x)=> Vue.set(state.CrParticipantsData,x.username , {'first_name': x.first_name, 'last_name':x.last_name, 'roles': x.roles, 'document_url':x.document}));
    },

    setCurrentCrId(state,id){
      state.CurrentCrId=id;
    },
    setCurrentCrMsgs(state,payload) {
      state.CurrentCrMsgs = payload;
    },
    addCrMsg(state, payload){
                state.CurrentCrMsgs.push(payload)
                var l = state.CurrentCrMsgs.length - 1
                if (l > 0) {
                    if (state.CurrentCrMsgs[l].created_day == state.CurrentCrMsgs[l - 1].created_day) {
                        state.CurrentCrMsgs[l].created_newday = false
                    } else {
                        state.CurrentCrMsgs[l].created_newday = true
                    }
                } else {
                    state.CurrentCrMsgs[l].created_newday = true
                }
              }

};

export default {
  namespaced: true,
  state,
  getters,
  actions: {
      getCrNews ({commit,rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'multipart/form-data'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_NEWS"],

                      };
                      axios(config).then((response) => {
                        commit('setUserCaseRooms')
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of CaseRooms failed: ',e)
                          reject(e);
                      })
          })
          },

      loadUserCaseRooms ({commit,rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'multipart/form-data'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_LISTBYPARTICIPANT"],

                      };
                      axios(config).then((response) => {
                        commit('setUserCaseRooms', {'caserooms':response.data, 'resetUserCaseRooms':true})
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of CaseRooms failed: ',e)
                          reject(e);
                      })
          })
          },

      loadHelpdeskCaseRooms ({commit,rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'multipart/form-data'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_LISTONLYHELPDESK"],
                      };
                      axios(config).then((response) => {
                          commit('setUserCaseRooms',response.data)
                          commit('setHelpDeskIds',response.data)
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of HelpdeskCaseRooms failed: ',e)
                          reject(e);
                      })
          })
          },


      getCrUsersWithSSM ({rootState}, payload){
          return new Promise((resolve, reject) => {
                  var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"] + payload.id + '/list_cr_users_w_ssm/',
                      };
                      axios(config).then((response) => {
                          resolve(response.data)
                      }).catch((e) => {
                        console.log('Loading of CaseRoom s SSMs failed: ',e)
                          reject(e);
                      })
          })
          },

      loadCaseRoomMsgs ({state,rootState}, payload){
          return new Promise((resolve, reject) => {
              state.CurrentCrId=payload.id;
                  var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                      params: {'caseroom': payload.id},
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_MESSAGES"],
                      };
                      axios(config).then((response) => {
                          resolve(response)
                      }).catch((e) => {
                        console.log('Loading of CaseRoomMessages failed: ',e)
                          reject(e);
                      })
          })
          },

       sendMsg ({rootState}, payload){
          return new Promise((resolve, reject) => {
                  var config = {
                      method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                      data: payload,
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_MESSAGES"],
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Send of CaseRoomMessage failed: ',e)
                          reject(e);
                      })
          })
          },
      retrieveCrMsg ({rootState}, id){
          return new Promise((resolve, reject) => {
                  var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM_MESSAGES"]+id+'/',
                      };
                      axios(config).then((response) => {
                          resolve(response.data)
                      }).catch((e) => {
                        console.log('CaseRoomMessage could not be retrieved: ',e)
                          reject(e);
                      })
          })
          },
      deleteUserNewsTag ({rootState}, payload){
          return new Promise((resolve, reject) => {
                  var config = {
                      method: 'PATCH',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"]+payload.id+'/eliminate_news_tag/',
                      };
                      axios(config).then((response) => {
                          resolve(response.data)
                      }).catch((e) => {
                          reject(e);
                      })
          })
          },
      getMedicalStaff ({rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_GETMEDICALSTAFF"],
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of MedicalStaff failed: ',e)
                          reject(e);
                      })
          })
          },

     getMedicalUsers ({rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_GETMEDICALUSERS"],
                        params: {
                          'language':'de'
                        }
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of MedicalUsers failed: ',e)
                          reject(e);
                      })
          })
          },

      validateUsers ({rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_VALIDATEUSERS"],
                            data: payload
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Validation of Users failed: ',e)
                          reject(e);
                      })
          })
          },

      createCaseRoom ({commit,rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"],
                            data: payload
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Caseroom creation failed: ',e)
                          commit('messagehub/setSnackBarMessage',{type:'error',text:e}, {root:true})
                          reject(e);
                      })
          })
          },

      deleteCaseroom ({commit,rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'DELETE',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"]+payload.caseroom+'/',
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Caseroom delete failed: ',e)
                          commit('messagehub/setSnackBarMessage',{type:'error',text:e}, {root:true})
                          reject(e);
                      })
          })
          },

      addUserToCaseroom ({commit,rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"]+payload.caseroom+'/add_user/',
                            data: payload
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Caseroom add User failed: ',e)
                          commit('messagehub/setSnackBarMessage',{type:'error',text:e}, {root:true})
                          reject(e);
                      })
          })
          },


      leaveCaseroom ({commit,rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"]+payload.caseroom+'/leave/',
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Caseroom leave failed: ',e)
                          commit('messagehub/setSnackBarMessage',{type:'error',text:e}, {root:true})
                          reject(e);
                      })
          })
          },

      removeUserFromCaseroom ({commit,rootState}, payload){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'POST',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CASEROOM"]+payload.caseroom+'/delete_user/',
                            data: payload
                      };
                      axios(config).then((response) => {
                        resolve(response)
                      }).catch((e) => {
                        console.log('Caseroom remove User failed: ',e)
                          commit('messagehub/setSnackBarMessage',{type:'error',text:e}, {root:true})
                          reject(e);
                      })
          })
          },


      getDependentChildren ({rootState}){
          return new Promise((resolve, reject) => {
              var config = {
                      method: 'GET',
                      headers: {
                      authorization: `Bearer ${rootState.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                          url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_GETDEPENDENTCHILDREN"],
                      };
                      axios(config).then((response) => {

                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of Dependent Children failed: ',e)
                          reject(e);
                      })
          })
          },

    },

   mutations,
};
