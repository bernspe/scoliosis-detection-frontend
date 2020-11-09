<template>
  <v-app>
    <v-navigation-drawer
      v-if="isLoggedIn"
      class="pt-2"
      v-model="isOpenDrawer"
      clipped
      app
    >
      <Menu></Menu>
    </v-navigation-drawer>
    <v-app-bar app color="primary" clipped-left dark>
      <v-app-bar-nav-icon
        v-if="isLoggedIn"
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
            alt="skoliosekinder name"
            contain
            src="./assets/schriftzug1-3.png"
            height="48"
          />
        </div>
      </router-link>

      <v-spacer></v-spacer>

      <v-btn v-if="!isLoggedIn" to="/login" outlined>
        Login
        <v-icon right>
          mdi-login
        </v-icon>
      </v-btn>

      <div v-else>
        <span>
          {{ username }}
          <v-icon large>
            mdi-account-circle
          </v-icon>
        </span>

        <v-btn class="ml-6" outlined @click="logout">
          Logout
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
import store from "./store"
import Vuetify from "vuetify";
import {mapGetters, mapState} from "vuex";
import Menu from "@/components/Menu";


export default {
  name: 'App',
  vuetify: new Vuetify(),
  components: { Menu },
  store,
  data: () => ({ isOpenDrawer: false,
        currSign:0,
        signTrials:0,
        maxSignTrials:10,
        logosigns: [
              "./assets/schriftzug1-1.png",
              "./assets/schriftzug1-2.png",
              "./assets/schriftzug1-3.png",
              "./assets/schriftzug1-4.png",
              "./assets/schriftzug1-5.png",
              "./assets/schriftzug1-6.png"
        ]
  }),

  computed: {
    ...mapState({
      username: state => state.auth.user.username
    }),
    ...mapGetters("auth", ["isLoggedIn"]),
    currSignURL: function () {
      return this.logosigns[this.currSign]
    },
  },
  methods: {
    logout: function () {
      this.$store.dispatch('auth/logout')
              .then(() => {
                this.$disconnect();
              })
    },
      nextLogoSign(){
        if (this.signTrials<this.maxSignTrials) {
          setInterval(function () {
            this.currSign = Math.floor((Math.random() * 6) + 1);
          }, 1000);
          this.signTrials += 1;
        }
      }
  },



};
</script>
