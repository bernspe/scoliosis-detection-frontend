const STATE = {
    data: null,

    username:'',
    password:'',
    authUser: {},
    isAuthenticated: false,
    userSocket:null,
    token: localStorage.getItem('token'),
    endpoints: {
        baseUrl: process.env.VUE_APP_BACKEND_URL,
        baseUrlFrontend: process.env.VUE_APP_FRONTEND_URL,
        splineAppUrl: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_SPLINEAPP_SUFFIX,
        obtainToken: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_TOKEN_URL_SUFFIX,
        webSocket: process.env.VUE_APP_WEBSOCKET_URL,

    },
    axiosBase: null,

    socket: {
      isConnected: false,
      message: '',
      reconnectError: false,
    },

    socketVm: null,

    selectEntriesKeys:[],
    entries: {},
    entry: {
        id:'',
        title: '',
        status: '',
        img:'',
        modimg:'',
        fdata:{}

    }
};

export default STATE;
