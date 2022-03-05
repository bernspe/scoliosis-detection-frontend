<template>
    <v-container class="CaseRoomForum"
    justify="center">
           <v-progress-linear
      indeterminate
      color="cyan"
      v-if="$asyncComputed.asyncUserCaseRooms.updating"
    >
           </v-progress-linear>
                <v-row
                justify="space-around"
                class="mb-6"
                v-if="asyncUserCaseRooms.length<4"
                >
                   <CrItem
                           v-for="entry in asyncUserCaseRooms"
                           :key="entry.id"
                           :cr_id="entry.id"
                            @CaseRoomDeleted="onCaseRoomDeleted"
                           @CaseRoomLeft="onCaseRoomLeft"
                   />
                    <div id="tracer_caseroomforum_critem"></div>
               </v-row>
        <v-data-table id="tracer_caseroomforum_datatable"
                      :headers="headers"
                      :items="asyncUserCaseRooms"
                      item-key="id"
                      class="elevation-1"
                        :search="search"
                      single-expand
                        :expanded.sync="expanded"
                      show-expand
                    >
                      <template v-slot:top>
                        <v-text-field
                          v-model="search"
                          label="In allen Diskussionsräumen suchen"
                          class="mx-4"
                        ></v-text-field>
                      </template>

                        <template v-slot:item.has_news_for_current_user="{ item }">
                          <v-icon
                          small
                            class="mr-2"
                          v-if="item.has_news_for_current_user"
                          color="red">
                               mdi-alert
                          </v-icon>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">
                      <td :colspan="headers.length">
                         <v-sheet
                                class="mx-auto"
                                elevation="8"

                              >
                             <CrItem :cr_id="item.id"
                            @CaseRoomDeleted="onCaseRoomDeleted"
                           @CaseRoomLeft="onCaseRoomLeft"
                            @CaseRoomChanged="onCaseRoomChanged"
                             />
                         </v-sheet>
                      </td>
                        </template>
                    </v-data-table>
        <v-row>
                <CrCreateDialog
                        v-if="isCaregiver || isAdult"
                @CaseRoomCreated="onCaseRoomCreated"></CrCreateDialog>

        </v-row>
        <v-tour name="caseroomforumTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </v-container>


</template>

<script>
    import CrItem from "@/components/CaseRoom/CaseRoomItem";
    import CrCreateDialog from "@/components/CaseRoom/CaseRoomCreate";

    import {mapGetters} from "vuex";
    import component_tracer from "@/mixins/component_tracer";
    export default {
        components: {CrItem, CrCreateDialog},
        name:'caseroomforum',
        mixins: [component_tracer],
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname','isCaregiver','isAdult']),
            ...mapGetters("caseroom", ['getUserCaseRooms','getUserCaseRoomsAsArray','getHelpDeskCaseRoomsAsArray','getParticipantFullname']),
            headers() {
                return [
                    {
                        text: 'News',
                        sortable: true,
                        value: 'has_news_for_current_user',
                    },
                    {
                        text: 'Titel',
                        align: 'start',
                        sortable: true,
                        value: 'title'
                    },
                    {
                        text: 'Eigentümer',
                        sortable: true,
                        value: 'owner_fullname',
                    },
                    {
                        text: 'Mitglieder',
                        sortable: true,
                        value: 'members_fullname',
                    },

                ]
            },
        },
        asyncComputed: {
            sumOfNews:
                {
                    get() {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                let a;
                                if (this.helpdesk) a = this.getHelpDeskCaseRoomsAsArray
                                 else a = this.getUserCaseRoomsAsArray
                                if (a.length===0) reject()
                                else {
                                    resolve(a.map((x) => {
                                        if (x) {
                                        if (Object.prototype.hasOwnProperty.call(x,'has_news_for_current_user'))
                                            return (x.has_news_for_current_user ? 1 : 0)
                                             }}).reduce((a, b) => a + b, 0))
                                }
                            }, 1000)
                            })
                            },
                    default: 0
                },
            asyncUserCaseRooms: {
                get () {
                    return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                var target = this.helpdesk ? 'caseroom/loadHelpdeskCaseRooms' : 'caseroom/loadUserCaseRooms'
                                this.$store.dispatch(target)
                                    .then((result) => {
                                        const ms = result.data.map(o => o.members);
                                        const os = result.data.map(o => o.owner);
                                        const unique_ms = [...new Set(ms.flat(1).concat(os.flat(1)))]
                                        this.$store.dispatch('auth/getMinimalUserProfiles', {'usernames':unique_ms})
                                        .then((result)=> {
                                            this.$store.commit('caseroom/setParticipants',result)
                                            var target2 = this.helpdesk ? this.getHelpDeskCaseRoomsAsArray : this.getUserCaseRoomsAsArray
                                            resolve(target2)
                                        })
                                    })
                                    .catch((e) => {
                                        reject(e)
                                    })

                                }, 1000)
                            })
                },
                default: [],
                watch: ['helpdesk']

            }
        },
        watch: {
            sumOfNews: function(newVal, oldVal) {
                if (newVal != oldVal) this.$asyncComputed.asyncUserCaseRooms.update();
            },
        },
        methods: {
            onCaseRoomCreated: function () {
              this.$asyncComputed.asyncUserCaseRooms.update();
            },
            onCaseRoomDeleted: function () {
              this.expanded=[]
              this.$asyncComputed.asyncUserCaseRooms.update();
            },
            onCaseRoomLeft: function () {
              this.expanded=[]
                this.$asyncComputed.asyncUserCaseRooms.update();
            },
            onCaseRoomChanged: function () {
              this.$asyncComputed.asyncUserCaseRooms.update();
            }
        },
        data: () => ({
            expanded: [],
            search: '',
        }),
        props: {
           helpdesk: Boolean,
        },
    };
</script>
