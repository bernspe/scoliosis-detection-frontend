import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "@/store"
import LandingPage from "@/components/IntroTour/LandingPage";
import {authGuard} from "@/auth";
import ConsentForm from "@/components/ConsentForm/ConsentForm";

const LoginDialog = () => import("./components/LoginDialog.vue");
const QRCodeLogin = () => import("./components/QRCodeLogin.vue");
const Xrboard = () => import("./components/Xrboard.vue");
const EmailActivation = () => import("./components/EmailActivation.vue");
const Account = () => import("./components/Account/Account.vue");
const CaseRoomForum = () => import("./components/CaseRoom/CaseRoomForum.vue");
const CaseRoom = () => import("./components/CaseRoom/CaseRoom.vue");
const ConsentDocs = () => import("./components/Documents/ConsentDocs.vue");
const Dashboard = () => import("./components/Dashboard/Dashboard.vue");
const Impressum = () => import("./components/Impressum.vue");
const MLManager = () => import("./components/MLManager/MLManager.vue");
const SSMCenter = () => import("./components/SSMCenter/SSMCenter.vue");
const Preview = () => import("./components/Preview/Preview.vue");
const AuthorizedStart = () => import("./components/AuthorizedStart/AuthorizedStart2.vue");
const MetrixCenter = () => import("./components/MetrixCenter/MetrixCenter.vue");


Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            component: LandingPage,
            meta: {
                allowAnonymous: true
            },
            children: [
                {
                    path: '/preview',
                    name: 'preview',
                    component: Preview,
                    meta: {
                        allowAnonymous: true
                    },
                },
                {
                    path: '/authorized_start',
                    name: 'authorized_start',
                    component: AuthorizedStart,
                    meta: {
                        allowAnonymous: false
                    },
                },
            ]
        },
        {
            path: '/impressum',
            name: 'impressum',
            component: Impressum,
            meta: {
                allowAnonymous: true
            },
        },

        {
            path: '/qrlogin',
            name: 'Qrcodelogin',
            component: QRCodeLogin,
            meta: {
                allowAnonymous: true
            },
        },
        {
            path: '/login',
            name: 'logindialog',
            component: LoginDialog,
            meta: {
                allowAnonymous: true
            },
        },
        {
            path: '/activate/:username',
            name: 'emailactivation',
            component: EmailActivation,
        },
        {
            path: '/account',
            name: 'account',
            component: Account,
            meta: {
                allowAnonymous: false
            }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            meta: {
                allowAnonymous: false
            }
        },
        {
            path: '/mlmanager',
            name: 'mlmanager',
            component: MLManager,
            meta: {
                allowAnonymous: false
            }
        },
        {
            path: '/caseroomforum',
            name: 'caseroomforum',
            component: CaseRoomForum,
        },
        {
            path: '/caseroom/:id',
            name: 'caseroom',
            component: CaseRoom,
            props: true
        },
        {
            path: '/helpdeskforum',
            name: 'helpdeskforum',
            component: CaseRoomForum,
            props: {helpdesk: true}
        },
        {
            path: '/metrixcenter',
            name: 'metrixcenter',
            component: MetrixCenter,
        },
        {
            path: '/xrboard',
            name: 'xrboard',
            component: Xrboard,
        },

        {
            path: '/ssmcenter',
            name: 'ssmcenter',
            component: SSMCenter,
        },
        {
            path: '/consentdocs',
            name: 'consentdocs',
            component: ConsentDocs
        },
        {
            path: '/p0consent',
            name: 'p0consent',
            component: ConsentForm,
            props:{
                consent_type:"P0",
                omitButtons: true
            },
            meta: {
                allowAnonymous: true
            },
        },
    ]
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = store.getters['auth/isAuthenticated']
    if ((!to.meta.allowAnonymous) && (!isAuthenticated)) {
        authGuard

        console.log('Relaying ...', to)
        next('/')
        /*
        store.dispatch('auth/getLoginStatus').then(() => {
            console.log('Router Path 2')
                next()
            }).catch(() =>  {
                console.log('Router Path 3')
                next({
                    path: '/login',
                    query: {redirect: to.fullPath}
                })
       })
         */
    } else {
        next()
    }
})

/*
router.afterEach((to, from) => {
    if (to !== from) {
        var u=store.getters['auth/getterUserObject']
        if (u){
            var ct = store.getters['auth/getterComponentTraces']
            var uct = u.component_trace // previously saved traces
            var allMounts = Object.fromEntries(Object.keys(ct).concat(Object.keys(uct)).map(k => [k,{'mount_count':(ct[k] ? ct[k]['mount_count'] : 0) + (uct[k] ? uct[k]['mount_count'] : 0)}]))
            var combined = Object.assign(uct,allMounts)
            /*
            var sum_ct = ct ? Object.values(ct).map((x) => x.mount_count).reduce((a,b) => a+b,0) : 0
            var sum_uct = uct ? Object.values(uct).map((x) => x.mount_count).reduce((a,b) => a+b,0) : 0
            if (sum_ct > (sum_uct+2)) {  // only save new trace when it is at least 3 items bigger to reduce traffic

                store.dispatch('auth/updateAccountDetails', {component_trace:combined})
                    .then(()=> store.commit('auth/updateComponentTraces',{}))

            //}
        }
    }

})*/

export default router