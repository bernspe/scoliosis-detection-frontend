<template>
    <v-container>
     <v-chip-group
        v-model="selection"
        active-class="deep-purple--text text--accent-4"
        column
      >
        <v-chip
                class="ma-2 pa-2"

          v-for="consent in missingconsenttypes"
          :key="consent"
                @click="setCurrentConsent(consent)"

        >
          {{ de_consentType(consent) }}

                    </v-chip>
      </v-chip-group>

        <ConsentForm
                v-if="showConsent"
                :consent_type="currentconsent"
            @consentdecision="onConsentDecision"></ConsentForm>

        </v-container>
</template>


<script>

  import ConsentForm from "@/components/ConsentForm/ConsentForm";
  import axios from "axios";
  import {DE_CONSENTS} from "@/store/modules/auth";


  export default {
       components: {ConsentForm},
      props: {
          user:Object,

      },
    data: () => ({
        currentconsent:null,
        showConsent:false,
        currentinvolvedusers:[],
        selection: null,
        workedconsents:[],
        missingconsenttypes:[],

    }),
      computed: {
      },
      mounted() {
           this.getMissingConsents()
      },
      watch: {
        workedconsents(newValue,oldValue) {
            if (oldValue) {
                if (newValue.length == this.missingconsenttypes.length) {
                    this.$emit('alldone')
                }
            }
        }
      },
      methods: {
          de_consentType: function (contype) {
                return DE_CONSENTS[contype]
            },
          getMissingConsents: function() {
               var username = this.user.username
               var config2 = {
                   method: 'GET',
                   url: this.$store.state.endpoints.baseUrl + process.env.VUE_APP_USERACCOUNTS_SUFFIX + username + '/getmissingconsents/',
                   headers: {
                       authorization: `Bearer ${this.$store.state.token}`,
                       'Content-Type': 'application/json'
                   },
                   xhrFields: {
                       withCredentials: true
                   },
               };
               axios(config2).then((response2) => {
                   this.missingconsenttypes = response2.data
               }).catch((e) => {
                   console.log(e)
               })
           },

        onConsentDecision(payload){
            if (payload) {
                this.workedconsents.push(this.currentconsent)
            }
            this.showConsent=false
        },

          setCurrentConsent(consenttype) {
            this.currentconsent=consenttype
            this.showConsent=true
          },

      },

  }
</script>