<template>

  <div class="mt-8 text-center" margin-top="60px">

    <div class="d-flex justify-center mb-6">
      <v-img
          lazy-src="../assets/s_logo.png"
          max-height="350"
          max-width="250"
          src="../assets/skolioselogo.png"
        ></v-img>
      </div>
    <div v-if="isAuthenticated">
      <h1>Willkommen bei skoliosekinder.de !</h1>
      <p>Du bist angemeldet als: {{ getterFirstname }}</p>
      <p>Möchtest Du eine Tour durch unser Angebot machen, dann folge diesem Link!</p>
    </div>
    <div v-else>
      <h1>skoliosekinder.de</h1>
      <p>Du bist abgemeldet. Möchtest Du Dich anmelden, dann ...</p>
      <v-btn to="/login" outlined color="primary">
        Login
        <v-icon right>
          mdi-login
        </v-icon>
      </v-btn>
    </div>
  </div>

</template>

<script>
    import {mapGetters} from "vuex";

    export default {
  name: "xrboard",

      methods: {

      },

  computed: {

    ...mapGetters("auth", ["isAuthenticated", 'getterFirstname'])
  }
    };
</script>
