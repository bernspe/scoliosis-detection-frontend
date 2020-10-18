<template>
  <v-app>
    <v-app-bar app></v-app-bar>
    <v-main>

  <v-card>
    <v-app-bar
      color="deep-purple"
      dark
    >
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

      <v-toolbar-title>XR Machine</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
    >
      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-8"
        >
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
                <router-link to="/">Home</router-link>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
                <router-link to="/login">Login</router-link>
            </v-list-item-icon>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>

          <template v-if="getterAuth">
                      <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-book-multiple-outline</v-icon>
                <router-link to="/xrlist">XR List</router-link>
            </v-list-item-icon>
            <v-list-item-title>XR List</v-list-item-title>
          </v-list-item>

            <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-radiology-box-outline</v-icon>
                <router-link to="/xrsubmit">XR submit</router-link>
            </v-list-item-icon>
            <v-list-item-title>Submit New XRs</v-list-item-title>
          </v-list-item>

          </template>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <router-view/>


        <v-container>
            </v-container>
  </v-card>
    </v-main>
  </v-app>
</template>

<script>
import store from "./store"
import Vuetify from "vuetify";
import {mapGetters} from "vuex";

export default {
  name: 'App',
  vuetify: new Vuetify(),
  store,
  data: () => ({
      drawer: false,
      group: null,
    }),
  computed: mapGetters(['getterAuth']),

};
</script>
