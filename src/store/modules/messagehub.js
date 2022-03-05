const MESSAGE_DICT = {
    'STARTUP_DISCLOSURE': 'Bei dieser App handelt es sich um eine Testversion - sie darf nicht zu medizinischen Zwecken eingesetzt werden. Weitere Hinweise, auch zum Datenschutz erhalten sie in unserem Impressum.',
    'CASEROOM_NEEDS_CONSENT': 'Andere Benutzer benötigen Deine Zustimmung, um weiterarbeiten zu können.'
}

const state = () => ({
    messages: [],
    snackbar_message: '',
    snackbar_message_type: '',
});

const getters = {
    getterMessages: (state) => {
        return state.messages
    },
    getterSnackBarMessage: (state) => {
        if ((state.snackbar_message.length>0) && (state.snackbar_message_type.length>0))
            return {type: state.snackbar_message_type, text: state.snackbar_message}
        else return null
    },
}

const mutations = {
    addMessage(state,payload){
        var m={'text': MESSAGE_DICT[payload.message_type], ...payload}
        var t = state.messages.filter((x)=>x.text===m.text) // avoid pushing same type msg twice
        if (t.length===0) state.messages.push(m)
    },
    resetMessage(state){
        state.messages=[]
    },
    setStartupDisclosure(state){
        state.snackbar_message_type='info'
        state.snackbar_message=MESSAGE_DICT['STARTUP_DISCLOSURE']
    },
    setSnackBarMessage(state,payload){
        state.snackbar_message_type=payload.type
        state.snackbar_message=payload.text
    },
    resetSnackBarMessage(state){
        state.snackbar_message=''
        state.snackbar_message_type=''
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: {}
}