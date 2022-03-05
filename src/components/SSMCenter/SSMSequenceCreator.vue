<template>

    <v-dialog
      v-model="sequencedialog"
      persistent
    >
        <v-card>
          <v-stepper v-model="e1" alt-labels>
                <v-stepper-header>
                  <v-stepper-step
                    :complete="e1 > 1"
                    step="1"
                    :rules="[() => seq_userfind_validate]"
                  >
                    Nutzer
                      <small v-if="seq_userfind_validate!==true"> {{ seq_userfind_validate }} </small>
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step
                    :complete="e1 > 2"
                    step="2"
                    :rules="[() => seq_crcreate_validate]"
                  >
                    Diskussionsraum
                      <small v-if="seq_crcreate_validate!==true">  {{ seq_crcreate_validate }}</small>
                  </v-stepper-step>

                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-card
                      class="mb-12"
                      id="tracer_ssmseq_userfinder"
                    >
                        <v-row dense>
                        <v-col cols="10">
                        <v-card-title>
                                Benutzer finden
                        </v-card-title>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon v-if="!dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                        <v-icon>mdi-information-outline</v-icon>
                                    </v-btn>
                                    <v-btn icon v-if="dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                        <v-icon>mdi-information</v-icon>
                                    </v-btn>
                        </v-col>
                        </v-row>
                        <UserFinder @userfinder_userselected="sequence_onuserselected1"></UserFinder>
                    </v-card>
                    <v-btn
                      color="primary"
                      @click="e1 = 2"
                      :disabled="target_users.length===0"
                    >
                      Weiter
                    </v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-card
                      class="mb-12"
                      id="tracer_ssmseq_caseroom"
                    >
                        <v-row dense>
                        <v-col cols="10">
                        <v-card-title>
                                Diskussionsraum finden oder schaffen
                        </v-card-title>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon v-if="!dialogInfoSwitch2" @click="dialogInfoSwitch2=!dialogInfoSwitch2">
                                        <v-icon>mdi-information-outline</v-icon>
                                    </v-btn>
                                    <v-btn icon v-if="dialogInfoSwitch2" @click="dialogInfoSwitch2=!dialogInfoSwitch2">
                                        <v-icon>mdi-information</v-icon>
                                    </v-btn>
                        </v-col>
                        </v-row>
                        <v-card-title>Diskussionsräume</v-card-title>
                    <v-card-subtitle v-if="target_users.length>0"> {{ target_users.map(x => x.name).join(',') }} </v-card-subtitle>
                    <v-card-subtitle v-if="get_cr_of_target_users.length>0">... ist bereits Mitglied in diesen Diskussionsräumen:</v-card-subtitle>
                    <v-chip-group>
                        <v-chip v-for="(item,index) in get_cr_of_target_users" :key="index">
                            {{ item.title }}
                        </v-chip>

                    </v-chip-group>
                        <v-btn v-if="get_cr_of_target_users.length>0" color="primary" text success @click="sequence_make_caseroom">Neuen Diskussionsraum erstellen</v-btn>

                        <v-card-subtitle v-if="get_cr_of_target_users.length===0">Wir müssen noch einen Diskussionsraum eröffnen</v-card-subtitle>
                        <v-card-subtitle v-if="get_cr_of_target_users.length===0">Geplante Mitglieder dafür sind: </v-card-subtitle>
                        <v-chip-group v-if="get_cr_of_target_users.length===0">
                            <v-chip v-for="(item,index) in target_users" :key="index">
                                {{ item.name }}
                            </v-chip>
                            <v-chip outlined color="green"> {{ getterUserObject.first_name }} {{ getterUserObject.last_name }} (ich)</v-chip>
                            </v-chip-group>

                    </v-card>
                    <v-btn
                      color="primary"
                      @click="sequence_make_caseroom"
                    >
                      Fertig
                    </v-btn>
                  </v-stepper-content>


                </v-stepper-items>
          </v-stepper>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            outlined
            @click="sequencedialog = false"
          >
            Abbrechen
          </v-btn>
        </v-card-actions>
            <v-tour name="SsmsequencecreatorTour" :steps="dialogTourSteps" :options="tourOptions" :callbacks="dialogTourCallbacks"></v-tour>
    </v-card>
    </v-dialog>

</template>

<script>
    import UserFinder from "@/components/CaseRoom/UserFinder";
    import {mapGetters} from "vuex";
    import component_tracer from "@/mixins/component_tracer";
    require('datejs');
    Date.i18n.setLanguage('de-DE');

    export default {
        name: 'Ssmsequencecreator',
        mixins: [component_tracer],
        components: {UserFinder},
        data () {
              return {
                  ssm_target_user_selected: null,
                sequencedialog: true,
                  seq_userfind_validate:true,
                  seq_crcreate_validate: true,
                  e1: 1,
                  target_users:[],
                  dialogInfoSwitch1:false,
                  dialogInfoSwitch2:false,
                    dialogTourCallbacks:{},
              }
        },
        computed: {
            ...mapGetters('caseroom',['getUserCaseRoomsAsArray']),
            ...mapGetters('auth',['getterUserObject']),
            dialogTourSteps() {
              return this.e1 ? this.tourSteps.slice(this.e1-1,this.e1) : this.tourSteps
            },
           get_cr_of_target_users: function() {
               let cr=[];
               this.getUserCaseRoomsAsArray.forEach((caseroom) => {
                   var m = [...caseroom.members,caseroom.owner]
                   var res = this.target_users.every(user => m.includes(user.username))
                   if (res) cr.push(caseroom)
               })
                return cr
           },
            ssm_target_user:  {
               get () {
                   if (!this.ssm_target_user_selected) {
                       var i= this.target_users.findIndex(user => user.roles.includes('Child') || user.roles.includes('Adult') || user.roles.includes('Patient'))
                       if (i!==-1) {
                           return this.target_users[i]
                       } else {
                           return null
                       }
                   } else return this.ssm_target_user_selected
               },
                set(val) {
                   this.ssm_target_user_selected = val
                }

            },

        },
        watch: {
            sequencedialog: function(val) {
                if (!val) {
                    this.e1= 1
                    this.target_users=[]
                    this.ssm_target_user= null
                    this.$emit('SSMSequenceDialogClosed')
                }
            },
            dialogInfoSwitch1(newVal,oldVal) {
            if (newVal !== oldVal) {
                if (newVal) {
                    this.startTour(true)
                } else this.stopTour()
            }
          },
            dialogInfoSwitch2(newVal,oldVal) {
            if (newVal !== oldVal) {
                if (newVal) {
                    this.startTour(true)
                } else this.stopTour()
            }
          },

        },
        mounted() {
                      var this1=this
            this.dialogTourCallbacks={
                onFinish: () => {this1.dialogInfoSwitch1=false; this1.dialogInfoSwitch2=false}
            }
        },
        methods: {
          sequence_onuserselected1: function(payload) {
              this.target_users=payload
              var roles_array= payload.some((x) => (x.roles.includes('Child') || x.roles.includes('Adult') || x.roles.includes('Patient')))
              if (roles_array || roles_array.length===0) {
                this.seq_userfind_validate=true
              } else {
                  this.seq_userfind_validate='Kind oder Patient erforderlich!'
              }
              if (this.seq_userfind_validate===true) this.e1=2
          },

            sequence_make_caseroom: function() {
                    if (this.get_cr_of_target_users.length===0) {
                        var m = [...this.target_users, this.getterUserObject]
                        this.$store.dispatch('caseroom/createCaseRoom', {
                                'members': m.map((x) => x.username), 'title': ''
                            }
                        ).then((response) => {
                            this.$store.commit('messagehub/setSnackBarMessage', {
                                type: 'info',
                                text: 'Ein Diskussionsraum mit dem Titel ' + response.data.title + ' wurde angelegt. Du kannst dort weitere Mitglieder hinzufügen.'
                            })
                            this.e1 = 3
                        }).catch((e) => {
                            console.log('Error :', e)
                            this.seq_crcreate_validate = 'Fehler beim Erstellen des Diskussionsraums'
                            this.$store.commit('messagehub/setSnackBarMessage', {type: 'error', text: e})
                        }).finally(()=> this.sequencedialog=false)
                    } else this.sequencedialog=false
            },

        },
    };
</script>
