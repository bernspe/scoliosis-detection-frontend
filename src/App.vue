<template>
  <v-app>
    <v-navigation-drawer
      v-if="isAuthenticated"
      class="pt-2"
      v-model="isOpenDrawer"
      clipped
      app
    >
      <Menu></Menu>
    </v-navigation-drawer>
    <v-app-bar app color="primary" clipped-left dark>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click="isOpenDrawer = !isOpenDrawer"
      ></v-app-bar-nav-icon>

      <router-link to="/">
        <div class="d-flex align-center">
          <v-img
            alt="Skoliosekinder Logo"
            class="shrink mr-2"
            contain
            src="./assets/logo2-gelb.png"
            transition="scale-transition"
            width="40"
          />

          <v-img
                  v-if="$vuetify.breakpoint.smAndUp"
            alt="skoliosekinder name"
            contain
            src="./assets/schriftzug1-3.png"
            height="48"
          />
        </div>
      </router-link>

      <v-spacer></v-spacer>

      <v-btn v-if="!isAuthenticated" to="/login" outlined>
        Anmelden
        <v-icon right>
          mdi-login
        </v-icon>
      </v-btn>

      <div v-else>
        <span>
          {{ getterFirstname }}
          <v-icon large
          v-if="isValidatedUser">
            mdi-account-check
          </v-icon>
          <v-icon large
          v-if="isNonValidatedUser"
          @click="reFetchUser">
            mdi-account-question
          </v-icon>
          <v-icon large
          v-if="isStaff">
            mdi-account-star
          </v-icon>
          <v-icon large
                  v-if="hasNews">
            mdi-message-alert-outline
          </v-icon>
        </span>


        <v-btn class="ml-6" outlined @click="logout">
          Abmelden
          <v-icon right>
            mdi-logout
          </v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
    <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Vuetify from "vuetify";
import {mapActions, mapGetters} from "vuex";
import Menu from "@/components/Menu";


export default {
  name: 'App',
  vuetify: new Vuetify(),
  components: { Menu },
  data: () => ({ isOpenDrawer: false,

  }),

  computed: {
    ...mapGetters("auth", ["isAuthenticated",'getterFirstname','getterUsername','isValidatedUser','isNonValidatedUser','isStaff','getterUsernameSimple']),
    ...mapGetters(['getterBackendVersion','getterFrontendVersion']),
    hasNews () {
      if (this.isAuthenticated) {
        let username = this.getterUsernameSimple
        let cr = this.$store.state.caseroom.UserCaseRooms
        if (cr) {
          let news = Object.values(cr).map((x) => x.news_for_participants.includes(username))
          return news.includes(true)
        }
        return false
      } else {
        return false
      }
      },
  },

  mounted()  {
    const this1 = this;
    this.$store.dispatch('getBackEndVersion')
    .then(()=> {
      //return new Promise(() => {
        let bv=this1.$store.getters['getterBackendVersion']
        let saved_bv=localStorage.getItem('backend_version');
        let fv=this1.$store.getters['getterFrontendVersion']
        let saved_fv=localStorage.getItem('frontend_version');
        console.log('Version check. Cached: Frontend=',saved_fv,', Backend=',saved_bv, '. Last: Frontend=',fv,', Backend=',bv)
        if ((bv!=saved_bv)|(fv!=saved_fv)){
          localStorage.setItem('backend_version',bv)
          localStorage.setItem('frontend_version',fv)
          console.log('Forcing reload')
          window.location.reload(true)
        }
       //  }, 1000)
    }).finally(()=> {

        this.$store.commit('auth/checkAuthentication')

        this.$store.dispatch('auth/checkToken')
                .then(()=>{
               const username = this1.getterUsername;
                          console.log('Username: ',username);
                          this1.$connect(this1.$store.state.endpoints.webSocket + 'user/' + username + '/', {
                              format: 'json',
                              store: this1.$store
                          })
              console.log('Mount Login successful')
            }).catch(()=>{
              console.log('Automatic Login not successful')
            }).finally(()=>{
              this.$options.sockets.onclose = () => this.$store.dispatch('auth/logout')
        })

      })

      this.$nextTick(() => {
        this1.$store.dispatch('caseroom/loadUserCaseRooms')
      })
},

  methods: {
    ...mapActions('auth',['reFetchUser']),
    logout: function () {
      this.$store.dispatch('auth/logout')
              .then(() => {
                this.$disconnect()
                console.log('Logout succesful')
              })
    },

  },

};
</script>
