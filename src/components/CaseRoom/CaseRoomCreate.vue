<template>
        <v-dialog class="CrCreateDialog" v-model="dialog" persistent max-width="600px" min-width="360px">

         <template v-slot:activator="{ on, attrs }">
                          <v-fab-transition>
              <v-btn
                color="pink"
                dark
                bottom
                right
                fab
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-plus</v-icon>

              </v-btn>
            </v-fab-transition>
         </template>

            <v-card>
                <v-form @submit.prevent="createCaseRoom"
                ref="createForm"
                v-model="valid"
                lazy-validation>
            <v-card-title>
                <span class="headline">Eröffne einen neuen Diskussionsraum</span>
            </v-card-title>
            <v-card-text>
                <v-container>

                    <v-row>
                        <v-text-field
                                v-model="crtitle"
                          label="Betrifft: "
                          required
                                :rules="TitleRules"
                        ></v-text-field>
                    </v-row>
                    <v-row>
                        <v-col
                        cols="12"
                      >
                        <UserSelector2
                        @updateMembers="onUpdateMembers"
                        ></UserSelector2>
                        </v-col>
                    </v-row>
                    <v-row>
                        <ConsentForm
                        v-if="showconsentform"
                        :consent_type="consent_type"
                          :involved_users="validated_usernames"
                          @consentdecision="onConsentDecision"
                        >

                        </ConsentForm>
                    </v-row>
                </v-container>
            </v-card-text>

                <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
                  v-show="validate_button"
            color="blue darken-1"
            text
            @click="validateUsers"
          >
            Weiter ...
          </v-btn>
          <v-btn
                  v-show="consent_button"
            color="blue darken-1"
            text

          >
            Akzeptieren ...
          </v-btn>
          <v-btn
                  v-show="create_button"
            color="blue darken-1"
            text
                  type="submit"

          >
            Diskussionsraum eröffnen
          </v-btn>
        </v-card-actions>
                </v-form>
        </v-card>


        </v-dialog>
</template>

<script>
    import UserSelector2 from "@/components/CaseRoom/UserSelector2";
    import ConsentForm from "@/components/ConsentForm/ConsentForm";

    export default {
        components: {UserSelector2, ConsentForm},
        props: {
        },
        data: () => ({
            dialog: false,
            valid:false,
            crtitle: '',
            TitleRules: [v => !!v || "Erforderlich."],
            members: [],
            members_usernames:[],
            validated_usernames:[],
            validate_button: true,
            create_button: false,
            consent_button: false,
            consent_type:"P3",
            showconsentform: false,
        }),
        methods: {
          onUpdateMembers(payload){
              this.members = payload.map(x => x.name)
              this.members_usernames = payload.map(x => x.username)
          },
            validateUsers() {
              if (this.$refs.createForm.validate()) {
                  if (this.members) {
                      this.$store.dispatch('caseroom/validateUsers', {'names': this.members})
                          .then((response) => {
                              if (response.data['ambiguous'].length) {
                                  console.log('Those names are ambiguous: ', response.data['ambiguous'])

                              }
                              if (response.data['unknown'].length) {
                                  console.log('Those names are unknown: ', response.data['unknown'])

                              }
                              if (response.data['matched'].length) {
                                  this.validated_usernames = response.data['matched'].map(x => x[0].username)

                                  console.log('Those names are found: ', this.validated_usernames)
                              }
                              this.validate_button = false
                              this.showconsentform = true
                          })
                  }
              }
            },

            onConsentDecision: function(payload) {
              if (payload)  {
                  this.createCaseRoom()
              }
             },
            createCaseRoom() {
                   this.$store.dispatch('caseroom/createCaseRoom', {
                           'title': this.crtitle,
                           'members': this.validated_usernames
                       }
                   ).then((response) => {
                       console.log('Caseroom created ', response)
                       this.$emit('CaseRoomCreated')
                   }).catch((e) => {
                       console.log('Error :', e)
                   })

                   this.dialog = false

              },
            resetForm() {
                    this.dialog= false
                    this.crtitle= ''
                    this.members= []
                    this.members_usernames=[]
                    this.validated_usernames=[]
                    this.validate_button= true
                    this.create_button= false
                    this.consent_button= false
                    this.showconsentform= false

            }


        },
    };
</script>
