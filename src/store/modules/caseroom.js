import axios from "axios";
import {DateTime} from "luxon";
import {MEDROLES} from "@/store/modules/auth";

const state = () => ({
    UserCaseRooms: null,
    CrParticipantsData: null,
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

    getParticipantRole_DE: (state) => (username) => {
        let result=null;
        if ((username.length>0) && (state.CrParticipantsData)){
            if (username in state.CrParticipantsData) {
                result=MEDROLES[state.CrParticipantsData[username].role];
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
            if (!state.UserCaseRooms[payload.id].news_for_participants.includes(payload.user)) {
                state.UserCaseRooms[payload.id].news_for_participants.push(payload.user)
            }
        }
    },
    addNewsToMemberTagsCurrentCr(state,payload) {
        //adds the news tag to all members of current caseroom, but not to the current user
        if (state.UserCaseRooms) {
            const user=payload.user
            const membersArray=payload.members.split(',')
            const members = membersArray.filter(e => e !== user) // exclude the current user
            members.forEach((m)=> {
                if (!state.UserCaseRooms[payload.id].news_for_participants.includes(m)) {
                    state.UserCaseRooms[payload.id].news_for_participants.push(m)
            }
            })
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
        //state.UserCaseRooms=payload
        state.UserCaseRooms=Object.assign({}, ...payload.map((x) => ({[x.id]: {'created': convertdt(x.created), 'expires':convertdt(x.expires), 'owner': x.owner, 'members':x.members, 'news_for_participants': x.news_for_participants, 'title':x.title}})));
    },
    setParticipants(state,payload){
        state.CrParticipantsData = Object.assign({}, ...payload.map((x) => ({[x.username]: {'first_name': x.first_name, 'last_name':x.last_name, 'roles': x.roles, 'document_url':x.document}})));
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
                        commit('setUserCaseRooms',response.data)
                        resolve(response)
                      }).catch((e) => {
                        console.log('Loading of CaseRooms failed: ',e)
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
                        console.log('Msg Retrieve Response: ', response.data)
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

      createCaseRoom ({rootState}, payload){
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
                          reject(e);
                      })
          })
          },

      deleteCaseroom ({rootState}, payload){
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
                          reject(e);
                      })
          })
          },
      leaveCaseroom ({rootState}, payload){
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
