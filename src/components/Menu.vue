<template>
  <div>
    <v-list-item>
      <v-icon large>
        mdi-account-circle
      </v-icon>

      <v-list-item-content class="ml-2">
        <v-list-item-title>{{ username }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense>
      <v-list-item v-for="item in items" :key="item.title" link :to="item.url">
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
  import {mapState} from "vuex";

export default {
  name: "Menu",
  data() {
    return {
      items: [
        { title: "Home", icon: "mdi-home", url: "/" },
        { title: "XR List", icon: "mdi-book-multiple-outline", url: "/xrlist" },
        { title: "XR Submit", icon: "mdi-radiology-box-outline", url: "/xrsubmit" }
      ]
    };
  },
computed:{
  ...mapState({
    username: state => state.auth.user.username
  })
  }
};
</script>
