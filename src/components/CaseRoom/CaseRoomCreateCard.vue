<template>
             <v-card>
            <v-card-title>
                <span class="headline">Eröffne einen neuen Diskussionsraum</span>
            </v-card-title>
            <v-card-text>
                <v-container>

                    <v-row>
                        <v-text-field
                                id="tracer_caseroomcreate_title"
                                v-model="crtitle"
                          label="Betrifft: "
                        ></v-text-field>
                    </v-row>
                    <v-row>
                        <v-col
                        cols="12"
                      >
                        <v-dialog v-model="adduserdialog" id="tracer_caseroomcreate_adduserdialog">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  color="purple"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                  outlined class="ma-2"
                                >
                                  Teilnehmer
                                    <v-icon
                                        right
                                        dark
                                    >mdi-account-plus</v-icon>
                                </v-btn>
                          </template>
                            <UserFinder @userfinder_userselected="onUpdateMembers"></UserFinder>
                        </v-dialog>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

                <v-card-actions>
          <v-spacer></v-spacer>
           <v-btn
            color="success"
            outlined
            @click="createCaseRoom"
          >
            OK
          </v-btn>

          <v-btn
            color="red"
            outlined
            @click="resetForm"
          >
            Abbrechen
          </v-btn>

        </v-card-actions>
                 <v-tour name="CaseroomcreatecardTour" :steps="tourSteps" :options="tourOptions"></v-tour>
        </v-card>

</template>

<script>
    import UserFinder from "@/components/CaseRoom/UserFinder";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        components: {UserFinder},
        props: {
            preload_members:Array,
        },
        name: 'Caseroomcreatecard',
        mixins: [component_tracer],
        data: () => ({
            adduserdialog: null,
            valid:false,
            crtitle: '',
            members: [],
            members_usernames: [],
        }),

        methods: {
          onUpdateMembers(payload){
              if (this.preload_members) {
                  this.members = [...this.preload_members,...payload]
              } else this.members = payload
              this.members_usernames = this.members.map((x) => x.username)
              this.$store.commit('caseroom/addParticipant',this.members)
              this.createCaseRoom()
              this.adduserdialog=false
              this.dialog=false
          },

            createCaseRoom() {
                   this.$store.dispatch('caseroom/createCaseRoom', {
                           'title': this.crtitle,
                           'members': this.members_usernames
                       }
                   ).then((response) => {
                       console.log('Caseroom created ', response)
                       this.$store.commit('messagehub/setSnackBarMessage', {
                            type: 'info',
                            text: 'Ein Diskussionsraum mit dem Titel ' + response.data.title + ' wurde angelegt. Du kannst dort weitere Mitglieder hinzufügen.'
                        })
                       this.$emit('CaseRoomCreated')
                   }).catch((e) => {
                       console.log('Error :', e)
                   })
                   this.dialog = false
              },
            resetForm() {
                    this.crtitle= ''
                    this.members_usernames=[]
                this.$emit('CaseRoomCreationAborted')
            }


        },

    };
</script>
