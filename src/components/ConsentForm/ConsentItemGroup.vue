<template>
    <v-container>
     <v-chip-group
        v-model="selection"
        active-class="deep-purple--text text--accent-4"
        column
      >
        <v-chip
                class="ma-2 pa-4 pt-8 pb-8"

          v-for="consent in consents"
          :key="consent.id"
                @click="setCurrentConsent(consent)"

        >
          {{ de_consentType(consent.content.consent_type) }} <br> {{ convertdt(consent.consent_date,'datetime')}}

                    </v-chip>
      </v-chip-group>

                <v-dialog
      v-model="dialog"
      persistent
    >    <v-card
                v-if="dialog"
                v-on="getContentDoc(currentconsent.content.document)"
                >
        <v-card-title>Einverständniserklärung</v-card-title>

                    <v-card-subtitle>Gegeben am {{ convertdt(currentconsent.consent_date,'datetime')}}</v-card-subtitle>
                    <v-card-subtitle>Betrifft folgende Personen:</v-card-subtitle>
                    <v-card-text>
                        <v-list-item
                            v-for="item in currentinvolvedusers"
                            :key="item.username"
                        >
                            <v-list-item-content>{{item.name}}</v-list-item-content>

                        </v-list-item>

                    </v-card-text>
                    <v-card-subtitle>Einwilligungstext</v-card-subtitle>
                <v-card-text>
              <div>
                <markdown-it-vue class="md-body" :content="currentcontent" />
              </div>
            </v-card-text>
        <v-card-actions>
                     <v-btn
            color="blue darken-1"
            text
            @click="dialog=false"
          >
            OK
          </v-btn>


        <!-- Dialog vor Zurückziehen der Einwilligung -->
        <div class="text-center">
            <v-dialog
              v-model="dialog2"

            >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="red lighten-2"
          dark
          outlined
          v-bind="attrs"
          v-on="on"
        >
          Einwilligung zurückziehen
                         <v-icon right
            >
                mdi-delete
            </v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          Einwilligung zurückziehen
        </v-card-title>

        <v-card-text>
          Hiermit ziehen sie die Einverständniserklärung zurück. Bitte beachten Sie, dass dieser Widerruf nur für zukünftige Aktionen gilt und ihre Nutzungsmöglichkeiten einschränken kann. Sie können jederzeit eine neue Einwilligung erteilen.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog2 = false"
          >
            Abbrechen
          </v-btn>
           <v-btn
            color="red lighten-2"
            text
            @click="withdraw(currentconsent.id)"
          >
            Einwilligung zurückziehen
               <v-icon right
            >
                mdi-delete
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

        </v-card-actions>
    </v-card>
    </v-dialog>

        </v-container>
</template>


<script>


  import DateTime from "luxon/src/datetime";
    import MarkdownItVue from 'markdown-it-vue'
    import 'markdown-it-vue/dist/markdown-it-vue.css'
    import axios from "axios";
  import {DE_CONSENTS} from "@/store/modules/auth";

  export default {
       components: { MarkdownItVue},
      props: {
          value:Array,
      },
    data: () => ({
        consents:[],
        currentconsent:null,
        currentcontent:"",
        currentinvolvedusers:[],
        selection: null,
        dialog:false,
        dialog2: false,

    }),
      computed: {

      },
      created(){
           this.consents=this.value;
      },
      methods: {
          de_consentType: function (contype) {
                return DE_CONSENTS[contype]
            },
           setCurrentConsent: function(consent) {
               this.$store.dispatch('auth/getMinimalUserProfiles', {'usernames': consent.involved_users}).then((result)=> {
                   this.currentinvolvedusers=result
               }).catch((e)=> {
                   console.log(e)
               })
             this.currentconsent=consent
             this.dialog=true
           },

          getContentDoc: function(docUrl) {
               var config2 = {
                            method: 'GET',
                            url: this.$store.state.endpoints.baseUrl.slice(0,-1)+docUrl, // remove the last slash from backendURL
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config2).then((response2)=>{
                        this.currentcontent=response2.data
                    }).catch((e)=> {
                        console.log(e)
                    })
           },
           convertdt: (dt, format) => {
                    const dtc=DateTime.fromISO(dt)
                    let fd=null;
                    if (format === 'datetime') {
                        fd= dtc.toLocaleString(DateTime.DATETIME_MED)
                    }
                    if (format === 'date') {
                        fd= dtc.toLocaleString(DateTime.DATE_MED)
                    }
                    if (format === 'month') {
                        fd=dtc.toFormat('yyyy-LL');
                    }
                    return fd;
            },
          withdraw:function (id) {
               console.log('Withdraw ',id)
               var config2 = {
                            method: 'GET',
                            url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENT+id+'/withdraw/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                axios(config2).then(()=>{
                    var idx=this.consents.findIndex(v => v.id == id)
                    this.consents.splice(idx,1)
                }).catch((e)=> {
                    console.log(e)
                })
              this.dialog=false
              this.dialog2=false
          }
      },

  }
</script>