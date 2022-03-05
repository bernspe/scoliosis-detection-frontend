const STATE = {
    versions:{
        frontend: process.env.VUE_APP_VERSION,
        frontend_date:process.env.VUE_APP_BUILD_DATE,
        backend:null,
        backend_date:null,
    },
    status:"",
    data: null,
    userSocket:null,
    informationSwitch: false,
    token: localStorage.getItem('token'),
    endpoints: {
        baseUrl: process.env.VUE_APP_BACKEND_URL,
        baseUrlFrontend: process.env.VUE_APP_FRONTEND_URL,
        splineAppUrl: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_SPLINEAPP_SUFFIX,
        collectionUrl: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_COLLECTION_SUFFIX,
        obtainToken: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_TOKEN_URL_SUFFIX,
        webSocket: process.env.VUE_APP_WEBSOCKET_URL,
        caseroom_webSocket: process.env.VUE_APP_CASEROOM_WEBSOCKET_URL,
        mlmodel_webSocket: process.env.VUE_APP_MLMODEL_WEBSOCKET_URL,
        userroles2: process.env.VUE_APP_BACKEND_URL+'userrole/list2/',
        consenttypes: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_CONSENTTYPES_SUFFIX,

        soc_auth_googleURL: process.env.VUE_APP_BACKEND_URL+process.env.VUE_APP_SOCIAL_AUTH_SUFFIX,
        soc_auth_googleID: process.env.VUE_APP_SOCIAL_AUTH_GOOGLE_ID,
    },
    oauth_credentials: {
        grant_type: 'password',
        client_id: process.env.VUE_APP_CLIENT_ID,
        client_secret: process.env.VUE_APP_CLIENT_SECRET,
        scope: process.env.VUE_APP_SCOPE,
    },

    socket: {
      isConnected: false,
      message: '',
      reconnectError: false,
    },

    socketVm: null,
    device: {
        isMobile: false,
        device_id: null,
        device_type: null,
        device_descriptor:null,
        isInList:null,
    },
    other_devices: []
};

export default STATE;
