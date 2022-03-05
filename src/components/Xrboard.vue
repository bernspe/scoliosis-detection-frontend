<template>

  <div class="mt-8 text-center" margin-top="60px">

    <v-btn color="primary" outlined @click.stop="startCamPanel=true">Star Camera Panel</v-btn>
    <VEasyCamPanel v-if="startCamPanel" @CamPanelClosed="startCamPanel=false"></VEasyCamPanel>

    <div class="d-flex justify-center mb-6" id="XB1">
      <v-img
          lazy-src="../assets/s_logo.png"
          max-height="350"
          max-width="250"
          src="../assets/skolioselogo.png"

        ></v-img>
       </div>
    <div v-if="isAuthenticated" id="XB2">
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
    import VEasyCamPanel from "@/components/VCamera/VEasyCamPanel";



    export default {
  name: "xrboard",

      components: {VEasyCamPanel},

      data: () => ({
        startCamPanel:false,
        }),

      computed:{


      ...mapGetters("auth", ["isAuthenticated", 'getterFirstname']),
      ...mapGetters(['getterAuthToken','getterInformationSwitch'])
    },
      mounted() {

      },
      methods: {

      }
    };
</script>
