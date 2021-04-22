import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginDialog from "@/components/LoginDialog";
import Xrboard from "@/components/Xrboard";
import Xrlist from "@/components/Xrlist";
import Xrsubmit from "@/components/Xrsubmit";
import EmailActivation from "@/components/EmailActivation";
import Entrypage from "@/components/Entrypage";
import TeenInfo from "@/components/TeenInfo/TeenInfo";
import store from "@/store"
import Account from "@/components/Account/Account";
import CaseRoomForum from "@/components/CaseRoom/CaseRoomForum";
import CaseRoom from "@/components/CaseRoom/CaseRoom";
import ConsentDocs from "@/components/Documents/ConsentDocs";
import Dashboard from "@/components/Dashboard/Dashboard";
import Impressum from "@/components/Impressum";


Vue.use(VueRouter)

const router = new VueRouter({
    mode:'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'entrypage',
            component: Entrypage,
            meta: {
                allowAnonymous: true
             },
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
            path: '/userinformation/teens',
            component: TeenInfo,
            meta: {
                allowAnonymous: true
             }
        },
        {
            path: '/userinformation/scoliosischild',
            name: 'scoliotic-child',
            component: TeenInfo,
        },
         {
            path: '/userinformation/scoliosisteens2',
            name: 'scoliotic-teen',
            component: TeenInfo,
        },
        {
            path: '/userinformation/scoliosisadult',
            name: 'scoliotic-adult',
            component: TeenInfo,
        },
        {
            path: '/userinformation/nonscoliosischild',
            name: 'nonscoliotic-child',
            component: TeenInfo,
        },
         {
            path: '/userinformation/nonscoliosisteens2',
            name: 'nonscoliotic-teen',
            component: TeenInfo,
        },
        {
            path: '/userinformation/nonscoliosisadult',
            name: 'nonscoliotic-adult',
            component: TeenInfo,
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
            path: '/xrboard',
            name: 'xrboard',
            component: Xrboard,

        },
        {
            path:'/login',
            name:'logindialog',
            component: LoginDialog,
            meta: {
                allowAnonymous: true
                },
        },
        {
          path:'/activate/:username',
          name: 'emailactivation',
          component: EmailActivation,
        },
        {
            path:'/xrlist',
            name: 'xrlist',
            component: Xrlist,
            props: { showAll: true }
        },
        {
            path:'/xrsubmit',
            name: 'xrsubmit',
            component: Xrsubmit
        },
        {
            path:'/consentdocs',
            name: 'consentdocs',
            component: ConsentDocs
        },
        {
            path:'/impressum',
            name: 'impressum',
            component: Impressum
        },
    ]
})

router.beforeEach((to, from, next) => {
    const status = store.getters['auth/getterStatus']
    const isAuthenticated = store.getters['auth/isAuthenticated']
    console.log('Login Status: ', status, 'Authenticated: ',isAuthenticated)

    if (!to.meta.allowAnonymous && !isAuthenticated) {

            store.dispatch('auth/getLoginStatus').then(() => {
                next()
            }).catch(() =>  {
                next({
                    path: '/login',
                    query: {redirect: to.fullPath}
                })
       })
    }
    else {
     next()
    }
})

export default router