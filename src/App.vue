<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense nav>
        <v-list-item link to="/login">
          <router-link to="/login"></router-link>
          <v-list-item-icon>
            <v-icon>mdi-book-multiple-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/xrlist">
          <router-link to="/xrlist"></router-link>
          <v-list-item-icon>
            <v-icon>mdi-book-multiple-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>XR List</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/xrsubmit">
          <router-link to="/xrsubmit"></router-link>
          <v-list-item-icon>
            <v-icon>mdi-radiology-box-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Submit New XRs</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

    </v-navigation-drawer>

    <v-app-bar color="deep-purple" dark app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>XR Machine</v-toolbar-title>
    </v-app-bar>

    <v-main>
    <router-view></router-view>
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
