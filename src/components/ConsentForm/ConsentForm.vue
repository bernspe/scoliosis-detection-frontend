<template>
    <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
    >
    <v-card>
        <v-card-title>Einverständniserklärung</v-card-title>
        <v-list subheader
            v-if="involved_users">
                <v-subheader>Betrifft folgende Personen</v-subheader>

                  <v-list-item
                          v-for="member in involved_users"
                    :key="member"
                  >
                      <v-list-item-content
                      v-if="member">
                          <v-list-item-title v-text="getParticipantFullname(member)"></v-list-item-title>
                          <v-list-item-subtitle v-text="getParticipantRole_DE(member)"></v-list-item-subtitle>
                        </v-list-item-content>
                  </v-list-item>
            </v-list>

                <v-card-text>
              <div>
                <markdown-it-vue class="md-body" :content="content" />
              </div>
            </v-card-text>
        <v-card-actions>
                     <v-btn
            color="blue darken-1"
            text
            @click="decline"
          >
            Nicht akzeptieren
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="accept"
          >
            Akzeptieren und Weiter
          </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
    </v-row>
</template>

<script>

    import MarkdownItVue from 'markdown-it-vue'
    import 'markdown-it-vue/dist/markdown-it-vue.css'
    import axios from "axios";
    import {mapGetters} from "vuex";

    export default {
        components: { MarkdownItVue},
        data () {
          return {
            dialog: true,
              content:"", // this is the document
              consentcontent:null, // this is the consentcontent object
              userdata:null
          }
        },
        computed: {
                    ...mapGetters("caseroom", ['getParticipantFullname', 'getParticipantRole_DE']),

                },
        methods: {
          accept: function() {
                  var config = {
                      method: 'POST',
                      headers: {
                          authorization: `Bearer ${this.$store.state.token}`,
                          'Content-Type': 'application/json'
                      },
                      xhrFields: {
                          withCredentials: true
                      },
                      url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CONSENT"],
                      data: {
                          'consent_content': this.consentcontent.id,
                          'involved_users': this.involved_users
                      }
                  };
                  axios(config).then((response) => {
                      console.log(response)
                      this.$emit('consentdecision', true)
                  }).catch((e) => {
                      console.log('Consent creation failed: ', e)
                  })
              this.dialog=false
             },
            decline: function() {
              this.$emit('consentdecision', false)
              this.dialog=false
             }
        },
        mounted()  {
                // get the latest consent entry of the specified type
                var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX+'recent_consent_doc/',
                        headers: {
                              authorization: `Bearer ${this.$store.state.token}`,
                              'Content-Type': 'multipart/form-data'
                          },
                          xhrFields: {
                              withCredentials: true
                          },
                        params: {consent_type: this.consent_type}
                    };
                // retrieve the document
                axios(config).then((response)=>{
                    this.consentcontent=response.data
                    var config2 = {
                            method: 'GET',
                            url: this.consentcontent.document,
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config2).then((response2)=>{
                        this.content = response2.data;
                    }).then(()=>{
                        if (this.involved_users) {
                            this.$store.dispatch('auth/getMinimalUserProfiles', {usernames: this.involved_users})
                                .then((response) => {
                                    this.$store.commit('caseroom/setParticipants', response)
                                })
                        }
                    })
                })
        },
        props: {
            consent_type: String,
            involved_users: Array,
        },
    };
</script>
