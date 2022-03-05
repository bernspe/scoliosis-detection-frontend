import Vue from 'vue'

function getYears (date) {
        const today = new Date().getTime()
        const birthday = new Date(date).getTime()
        var Difference_In_Years = (today-birthday) / (1000 * 3600 * 24 * 365);
        return Math.round(Difference_In_Years)
}

const state = () => ({
   userToInvite: {'roles':[]}

})

const getters = {
    getterUserToInvite: (state)=> {
        return state.userToInvite
    },
    getterUserToInviteBirthday: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,'birthday_date')) {
            return state.userToInvite.birthday_date
        } else {
            return null
        }
    },
    getterUserToInviteFullname: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,['firstname','lastname'])) {
            return state.userToInvite.firstname+' '+state.userToInvite.lastname
        } else {
            return null
        }
    },
    getterUserToInviteFirstname: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,['firstname'])) {
            return state.userToInvite.firstname
        } else {
            return null
        }
    },
    getterUserToInviteLastname: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,['lastname'])) {
            return state.userToInvite.lastname
        } else {
            return null
        }
    },
    getterUserToInviteEmail: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,['email'])) {
            return state.userToInvite.email
        } else {
            return null
        }
    },
    getterUserToInviteRoles: (state) => {
        if (Object.prototype.hasOwnProperty.call(state.userToInvite,['roles'])) {
            return state.userToInvite.roles
        } else {
            return []
        }
    }
}

const mutations = {
    setUserToInvite(state, payload) {
      Object.keys(payload).forEach((x) => Vue.set(state.userToInvite,x,payload[x]))
        if (Object.prototype.hasOwnProperty.call(payload,'birthday_date')) {
        if (getYears(payload.birthday_date)<18) {
                  if (!state.userToInvite.roles.includes('Child')) state.userToInvite.roles.push('Child')
              } else {
                const i=state.userToInvite.roles.indexOf('Child')
                if (i>-1) state.userToInvite.roles.splice(i,1)
            }
        }
    },
    setUserToInviteFirstName(state, payload) {
        Vue.set(state.userToInvite, 'firstname', payload)
    },
    setUserToInviteLastName(state, payload) {
        Vue.set(state.userToInvite, 'lastname', payload)
    },
    setUserToInviteEmail(state, payload) {
        Vue.set(state.userToInvite, 'email', payload)
    },
    setUserToInviteBirthday(state, payload) {
        Vue.set(state.userToInvite, 'birthday_date', payload)
        if (getYears(payload)<18) {
            if (!state.userToInvite.roles.includes('Child')) state.userToInvite.roles.push('Child')
              } else {
                const i=state.userToInvite.roles.indexOf('Child')
                if (i>-1) state.userToInvite.roles.splice(i,1)
            }
    },
    setUserToInviteRoles(state, payload) {
        Vue.set(state.userToInvite, 'roles', payload)
    },
    clearUserToInvite(state) {
        state.userToInvite = {'roles':[]}
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: {}
}