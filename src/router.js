import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginDialog from "@/components/LoginDialog";
import Xrboard from "@/components/Xrboard";
import Xrlist from "@/components/Xrlist";
import Xrsubmit from "@/components/Xrsubmit";


Vue.use(VueRouter)

export default new VueRouter({
    mode:'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'xrboard',
            component: Xrboard
        },
        {
            path:'/login',
            name:'logindialog',
            component: LoginDialog
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
        }
    ]
})

/*

router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  else next()
})

*/
