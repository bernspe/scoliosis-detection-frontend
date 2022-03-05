<template>
<v-container :key="getCurrentCrId">
                    <v-system-bar
                    height="50">
                    <v-chip-group v-for="m in getCurrentCrMemberStatus(getterUsernameSimple)" :key="m.name"
                    column id="UserChipGroup">
                        <v-chip
                          :color="m.watched ? 'green' : 'orange'"
                          outlined small
                        >{{ getParticipantFullname(m.name) }}
                        <v-icon v-if="m.watched">
                            mdi-check-all
                        </v-icon>
                            <v-icon v-else>
                                mdi-message-question
                            </v-icon>
                            <UserProfileDisplay :name="getParticipantFullname(m.name)" :document_url="getParticipantDocument(m.name)"></UserProfileDisplay>
                        </v-chip>
                    </v-chip-group>

                        <v-btn @click="deleteUserNewsTag({'id':getCurrentCrId})"
                        outlined
                               color="green"
                               class="mx-0"
                               id="DeleteUserNewsTagButton"
                               small
                        >Als Gelesen markieren</v-btn>
                </v-system-bar>


    <v-card class="CaseRoom"
    justify="center"
            >
        <v-row>
             <ConsentForm
                        v-if="showconsentform"
                        :consent_type="consent_type"
                          :involved_users="missing_usernames"
                          @consentdecision="onConsentDecision"
                        >
                        </ConsentForm>
        </v-row>

        <v-row justify="space-between">

                <v-col cols=4 align-self="end">
                    <v-btn color="indigo"
                    @click="getSSMs"
                    outlined
                    v-if="!ssm_username & hasSSM(getCurrentCrId)"
                    :disabled="isLoading">
                        <v-icon>
                            mdi-folder-multiple-image
                        </v-icon>
                        <span v-if="$vuetify.breakpoint.smAndUp">Bilder laden</span>
                    </v-btn>

                    <v-btn color="indigo"
                    @click="ssm_username=null"
                    outlined
                    v-if="ssm_username">
                        <v-icon>
                            mdi-close-box-multiple
                        </v-icon>
                        <span v-if="$vuetify.breakpoint.smAndUp">Bilderzeile schließen</span>
                    </v-btn>

                      <v-progress-circular
                        v-if="isLoading"
                        indeterminate
                        color="primary"
                        class="ma-2"
                        :size="20"
                        :width="2"
                      ></v-progress-circular>
                </v-col>
            </v-row>
                <v-card-text v-if="ssm_username">
                    <v-slide-group
                  v-model="model"
                  class="pa-2"
                  show-arrows
                >
                  <v-slide-item
                    v-for="(entry,id) in getEntriesByUser(ssm_username)" :key="id"
                  >
                    <SSMItem mini :ssm="entry" :id="id"></SSMItem>
                  </v-slide-item>
                </v-slide-group>


                </v-card-text>

                <v-card-text>
                    <v-row v-for="entry in getCurrentCrMsgs"
                              :key="entry.id" no-gutters>
                        <v-card-subtitle v-if="entry.created_newday">
                            {{entry.created_day}}
                        </v-card-subtitle>
                        <Caseroomentry :entry="entry" @crentryloaded="oncrentryloaded"></Caseroomentry>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                                <v-text-field
                                  v-model="input"
                                   id="msg_input"
                                  clearable
                                  rounded
                                  outlined
                                  filled
                                  append-outer-icon="mdi-send"
                                  label="Hier Textnachricht eingeben..."
                                  @keydown.enter="comment"
                                  @click:append-outer="comment"
                                >

                                </v-text-field>
               </v-card-actions>

        </v-card>

        <v-tour name="caseroomTour" :steps="tourSteps" :options="tourOptions"></v-tour>


</v-container>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import {convertUTCTime} from "@/store/modules/caseroom";
    import UserProfileDisplay from "@/components/Documents/UserProfileDisplay";
    import SSMItem from "@/components/SSMCenter/SSMItem";
    import ConsentForm from "@/components/ConsentForm/ConsentForm";
    import router from "@/router";
    import Caseroomentry from "@/components/CaseRoom/CaseRoomEntry";
    import component_tracer from "@/mixins/component_tracer";


    export default {
        name:'caseroom',
        mixins: [component_tracer],
        components: {Caseroomentry, UserProfileDisplay, SSMItem, ConsentForm},
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname']),
            ...mapGetters("caseroom", ['getParticipantFullname','getCurrentCrMsgs', 'getCurrentCr','getCurrentCrId','getCurrentCrMemberStatus','getParticipantDocument','getUserCaseRooms','hasSSM']),
            ...mapGetters("imagecenter", ['getterAllEntries','getterAllEntriesAsArray']),

        },
        methods: {
            ...mapActions({'deleteUserNewsTag':'caseroom/deleteUserNewsTag'}),
            oncrentryloaded(payload) {
                 this.crentries.indexOf() === -1 ? this.crentries.push(payload.id) : null
            },
            parse_msg(msg) {
                if (msg.includes('$ACTION=')) {
                    const a= msg.split('$ACTION=')
                    const act = a[1].split(':')
                    return {'text':a[0],'command':act[0],'target':act[1]}
                } else {
                    return {'text':msg, 'command':null,'target':null}
                }
            },

            goToTarget(command,target) {
                if ((command!=null) && (target!=null)) {
                    this.$router.push({ name: 'caseroom', params: {id: target} })
                }
            },

           comment() {
               const sender = this.$store.getters['auth/getterUsernameSimple']
               this.$store.dispatch('caseroom/sendMsg', {'caseroom': this.getCurrentCrId, 'text': this.input, 'sender':sender})
               .then(() => {
                 //  var new_entry=convertUTCTime(result.data)
                 //  this.$store.commit('caseroom/addCrMsg',new_entry)
                   this.input=null;

               }).catch((e) => {
                    console.log(e)
                })
           },

            // SSM Management
            getSSMs() {
                // only the first of list entries will be displayed == response [0]
                this.isLoading=true
                var this1=this
                this.$store.dispatch('imagecenter/getssm_user_list')
                .then(()=> {
                    this1.$store.dispatch('caseroom/getCrUsersWithSSM',{id:this1.id})
                    .then((response) => {
                        this1.ssm_username=response[0].username;
                    })
                }).finally(()=> {
                    this1.isLoading=false
                })
            },

            // get selected SSM per username
            getEntriesByUser: function(username) {
                if (username && this.getterAllEntries) {
                    const subarray = Object.entries(this.getterAllEntries)
                    let subObj = subarray.filter((x) => x[1].owner_username == username)
                    return Object.fromEntries(subObj)
                }
            },

            onConsentDecision: function(payload) {
              if (payload)  {
                  this.showconsentform=false
                  this.initializeCaseroom(this.getCurrentCrId);
              } else {
                  this.showconsentform=false
                  router.push('/caseroomforum');
              }
             },

            initializeCaseroom: function (id) {
                if (id) {
                    this.crentries=[]
                    this.$store.dispatch('caseroom/loadCaseRoomMsgs', {'id': id})
                        .then((result) => {
                            const entries = result.data
                            var i;
                            for (i = 0; i < entries.length; i++) {
                                entries[i] = convertUTCTime(entries[i])
                                if (i == 0) {
                                    entries[i].created_newday = true
                                } else {
                                    if (entries[i].created_day == entries[i - 1].created_day) {
                                        entries[i].created_newday = false
                                    } else {
                                        entries[i].created_newday = true
                                    }
                                }
                            }
                            this.$store.commit('caseroom/setCurrentCrMsgs', entries)

                            this.$store.dispatch('caseroom/deleteUserNewsTag', {'id': id})
                                .then(() => {
                                    this.$store.commit('caseroom/deleteNewsFromCr', {
                                        'id': id,
                                        'user': this.getterUsernameSimple
                                    })
                                })
                        })
                        .catch((e) => {
                            if (this.getterUsernameSimple == e.response.data.caseroom_owner) {
                                this.missing_usernames = e.response.data.missing_usernames
                                this.showconsentform = true
                            } else {
                                this.$store.commit('messagehub/setSnackBarMessage', {type: 'info',text:'Caseroom muss erst noch vom Besitzer freigeschalten werden. Der Besitzer ist informiert.'})
                                router.push('/caseroomforum');
                            }

                        })
                }
            }
        },
        mounted() {
            if (this.id){
                this.$store.commit('caseroom/setCurrentCrId',this.id)
            }
            this.initializeCaseroom(this.getCurrentCrId);
            // Check if Websockt had died eventually and resusciate it
            /*
            if (this.$socket.OPEN == 0) {
                console.log('Reopen Websocket')
                const username = this.getterUsernameSimple;
                this.$connect(this.$store.state.endpoints.webSocket + 'user/' + username + '/', {
                          format: 'json',
                          store: this.$store
                      })
            }

             */
            // Scroll to bottom
            //this.$vuetify.goTo(this.$refs.msg_input, {duration: 300, easing: 'easeInOutCubic'})


        },
        beforeDestroy(){
                this.$store.commit('caseroom/setCurrentCrId', null)
        },
        data: () => ({
            showconsentform: false,
            consent_type: 'P3',
            missing_usernames: [],
            crentries:[],
            isLoading:false,
            input:null,
            model:null,
            ssm_username:null, // this is filled, when any of the caseroom members has corresponding ssm s


        }),
        watch: {
            $route(to, from) {
                if ((to.name=='caseroom') && (from.name=='caseroom')){
                    if (to.params.id != from.params.id){
                        this.initializeCaseroom(to.params.id)
                    }
                }
            },

            crentries(newVal, oldVal) {
                if (newVal.length == oldVal.length) {
                    if (this.getCurrentCrMsgs.length == newVal.length) {
                        document.getElementById("msg_input").scrollIntoView({ behavior: "smooth" })
                        //this.$vuetify.goTo(this.$refs.msg_input, {duration: 300, easing: 'easeInOutCubic'})
                    }
                }
            },
        },
        props: {
            id:String,
        },
    };
</script>
