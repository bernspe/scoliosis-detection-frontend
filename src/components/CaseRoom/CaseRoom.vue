<template>

    <v-card class="CaseRoom"
    justify="center"
            >
               <v-card-title>
                   Nachrichten
               </v-card-title>
                <v-card-subtitle
                v-if="title != 'Caseroom'">
                    Betrifft: {{ title }}
                </v-card-subtitle>

                <v-card-text>

                    <v-timeline

                    align-top
                    dense>
                        <div v-for="entry in getCurrentCrMsgs"
                              :key="entry.id">
                          <v-timeline-item
                                  v-if="entry.created_newday"
                            class="mb-6"
                            hide-dot
                          >
                              <span><strong>{{entry.created_day}}</strong></span>
                          </v-timeline-item>

                          <v-timeline-item
                                  small
                            >

                            <v-sheet
                                    class="mx-auto pa-2"
                                rounded

                            v-if="getterUsernameSimple==entry.sender">
                                <div class="font-weight-normal">
                                  <strong>{{ getParticipantFullname(entry.sender) }}</strong> @{{ entry.created_time }}
                                </div>
                                <div>{{ entry.text }}</div>
                          </v-sheet>
                              <v-sheet
                                    class="mx-auto pa-2"
                                rounded
                            elevation="2"
                            v-if="!getParticipantFullname(entry.sender)">
                                <div class="font-weight-light">
                                  ehemaliger Teilnehmer @{{ entry.created_time }}
                                </div>
                                <div class="font-weight-light">{{ entry.text }}</div>
                          </v-sheet>

                              <v-sheet v-if="((getterUsernameSimple!=entry.sender) && getParticipantFullname(entry.sender))" elevation="3" class="mx-auto pa-2" rounded>
                            <div class="font-weight-normal">
                                  <strong>{{ getParticipantFullname(entry.sender) }}</strong> @{{ entry.created_time }}
                                </div>
                                <div>{{ entry.text }}</div>
                              </v-sheet>
                          </v-timeline-item>
                            </div>

                              <v-timeline-item
                                fill-dot
                                class="white--text mb-12"
                                color="orange"
                                large
                              >
                                <template v-slot:icon>
                                  <span>{{getterFirstname}}</span>
                                </template>
                                <v-text-field
                                  v-model="input"
                                   ref="msg_input"
                                  hide-details
                                  flat
                                  label="Hier Textnachricht eingeben..."
                                  solo
                                  @keydown.enter="comment"
                                >
                                  <template v-slot:append>
                                    <v-btn
                                      class="mx-0"
                                      depressed
                                      @click="comment"
                                    >
                                      Post
                                    </v-btn>
                                  </template>
                                </v-text-field>
                              </v-timeline-item>
                      </v-timeline>
               </v-card-text>


                    <v-footer
                    absolute>
                    <v-chip-group v-for="m in getCurrentCrMemberStatus(getterUsernameSimple)" :key="m.name"
                    column id="UserChipGroup">
                        <v-chip
                          :color="m.watched ? 'green' : 'orange'"
                          outlined
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
                        >Als Gelesen markieren</v-btn>
                </v-footer>
        <v-tour name="caseroomTour" :steps="steps" :options="tourOptions"></v-tour>
</v-card>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import {convertUTCTime} from "@/store/modules/caseroom";
    import UserProfileDisplay from "@/components/Documents/UserProfileDisplay";
    export default {
        components: {UserProfileDisplay},
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname']),
            ...mapGetters("caseroom", ['getParticipantFullname','getCurrentCrMsgs', 'getCurrentCr','getCurrentCrId','getCurrentCrMemberStatus','getParticipantDocument']),


        },
        methods: {
            ...mapActions({'deleteUserNewsTag':'caseroom/deleteUserNewsTag'}),
           comment() {
               const sender = this.$store.getters['auth/getterUsernameSimple']
               this.$store.dispatch('caseroom/sendMsg', {'caseroom': this.id, 'text': this.input, 'sender':sender})
               .then(() => {
                 //  var new_entry=convertUTCTime(result.data)
                 //  this.$store.commit('caseroom/addCrMsg',new_entry)
                   this.input=null;

               }).catch((e) => {
                    console.log(e)
                })
           }
        },
        mounted() {
            this.$store.dispatch('caseroom/loadCaseRoomMsgs',{'id': this.id })
                .then((result) => {
                    const entries=result.data
                    var i;
                    for (i = 0; i < entries.length; i++){
                        entries[i]=convertUTCTime(entries[i])
                        if (i==0) {
                            entries[i].created_newday=true
                        } else {
                            if (entries[i].created_day==entries[i-1].created_day) {
                                entries[i].created_newday=false
                            } else {
                                entries[i].created_newday=true
                            }
                        }
                    }
                    this.$store.commit('caseroom/setCurrentCrMsgs',entries)
                    if (entries.length==0) {
                        this.$tours["caseroomTour"].start();
                    }
                    this.$store.dispatch('caseroom/deleteUserNewsTag',{'id': this.id })
                        .then(() => {
                            this.$store.commit('caseroom/deleteNewsFromCr', {'id':this.id, 'user':this.getterUsernameSimple})
                        })
                })
                .catch((e) => {
                    console.log(e)
                })
            // Check is Websockt had died eventually and resusciate it
            if (this.$socket.OPEN == 0) {
                console.log('Reopen Websocket')
                const username = this.getterUsernameSimple;
                this.$connect(this.$store.state.endpoints.webSocket + 'user/' + username + '/', {
                          format: 'json',
                          store: this.$store
                      })
            }
            // Scroll to bottom
            this.$vuetify.goTo(this.$refs.msg_input, {duration: 300, easing: 'easeInOutCubic'})


        },
        beforeDestroy(){
            this.$store.commit('caseroom/setCurrentCrId',null)
        },
        data: () => ({
            input:null,

            steps: [
            {
              target: "#UserChipGroup",
              content: "<p>Hier werden die Teilnehmer des Diskussionsraums angezeigt. ORANGE=Teilnehmer ist noch nicht auf dem aktuellen Stand. GRÜN=Teilnehmer hat Nachrichten gelesen.</p>",
                params: {
                  placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
                }
            },
            {
              target: "#DeleteUserNewsTagButton",
              content: "<p>Wenn Du nicht gerade antworten willst, kannst Du hier wenigstens zu erkennen geben, dass Du die Nachrichten gelesen hast.</p>",
                params: {
                  placement: 'top' // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
                }
            },
          ],
              tourOptions: {
                useKeyboardNavigation: false,
                labels: {
                    buttonSkip: 'Überspringen',
                    buttonPrevious: 'Vorherige',
                    buttonNext: 'Nächste',
                    buttonStop: 'Beenden'
                  }
            },

        }),
        props: {
            id: String,
            title: String,
        },
    };
</script>
