<template>
    <v-col class="CrItem"
            cols="12">

        <v-card
          elevation="2"
          outlined
        >
            <v-badge
            inline
            v-if="hasnews"
            ></v-badge>
            <router-link
                :to="{ name: 'caseroom', params: {id: cr_id, title: contents.title } }"
                style="text-decoration: none; color: inherit;">
                <v-row no-gutters>
                    <v-col cols="8">
                        <v-card-title>{{contents.title}}</v-card-title>
                        <v-card-subtitle>Eigentümer: {{getParticipantFullname(contents.owner)}}</v-card-subtitle>
                    </v-col>
                    <v-col cols="4">
                    <v-chip small class="mt-2" outlined color="primary"> {{contents.created.split(',')[0]}} </v-chip>
                    </v-col>


                    <v-chip-group
                            v-for="member in contents.members" :key="member" column>
                        <v-chip color="indigo"
                                large outlined class="pt-2 pb-2 ml-2"
                                :close="(contents.members_without_msg.includes(member)) && (contents.owner===getterUserObject.username)"
                                @click:close="remove_member(member)">
                            <v-list-item>
                                <v-list-item-content>
                                <v-list-item-title v-text="getParticipantFullname(member)"></v-list-item-title>
                                <v-list-item-subtitle v-text="getParticipantRole_DE(member)"></v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-chip>
                    </v-chip-group>

                </v-row>

                 </router-link>

            <v-card-text  v-if="contents.lastmsg">
                <Caseroomentry :entry="contents.lastmsg" include_date></Caseroomentry>
            </v-card-text>

            <v-card-actions v-if="!omit_btns">
                <v-row dense>
                <v-col>
                    <v-btn v-if="contents.owner===getterUserObject.username"
                @click="delCaseRoom"
                color="red"
                outlined class="ma-2"
                >Löschen
                <v-icon
                    right
                    dark
                  >
                    mdi-delete
                  </v-icon>
                </v-btn>
                    </v-col>

                    <v-col>
                <v-dialog v-model="adduserdialog">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="purple"
                          dark
                          v-bind="attrs"
                          v-on="on"
                          outlined class="ma-2"
                        >
                          Jemanden hinzufügen
                            <v-icon
                                right
                                dark
                            >mdi-account-plus</v-icon>
                        </v-btn>
                  </template>
                    <UserFinder @userfinder_userselected="critem_onuserselected"></UserFinder>
                </v-dialog>
                </v-col>

                <v-col>
                <v-btn v-if="contents.owner!==getterUserObject.username"
                @click="leaveCaseRoom"
                color="red"
                outlined
                >Verlassen
                <v-icon
                    right
                    dark
                  >
                    mdi-exit-run
                  </v-icon>
                </v-btn>
                </v-col>
                    </v-row>

            </v-card-actions>
        </v-card>

    </v-col>
</template>

<script>
    import {mapGetters} from "vuex";
    import {DateTime} from "luxon";
    import Caseroomentry from "@/components/CaseRoom/CaseRoomEntry";
    import UserFinder from "@/components/CaseRoom/UserFinder";

function convertdt(dt) {
    const dtc=DateTime.fromISO(dt)
    return dtc.toLocaleString(DateTime.DATETIME_MED)
}

    export default {
        components: {Caseroomentry, UserFinder},
        data: () => ({
            adduserdialog: null,
        }),
        computed: {
            ...mapGetters("caseroom", ['getParticipantFullname','getParticipantRole_DE','getLastMsg','getUserCaseRooms']),
            ...mapGetters("auth", ['getterUserObject']),

            contents () {
              return this.getUserCaseRooms[this.cr_id]
            },

            hasnews () {
                if (this.contents) {
                    const user = this.$store.getters['auth/getterUsernameSimple']
                    return this.contents.news_for_participants ? this.contents.news_for_participants.includes(user) : false
                }
                return false
            },

            lastmsg_created () {
              if (this.contents.lastmsg.created) {
                  return convertdt(this.contents.lastmsg.created)
              } else
                  return ''
            },
        },

        methods:{

            delCaseRoom: function () {
              this.$store.dispatch('caseroom/deleteCaseroom', {'caseroom':this.cr_id})
                .then(()=> {
                    this.$emit('CaseRoomDeleted')
                })
            },

            leaveCaseRoom: function () {
              this.$store.dispatch('caseroom/leaveCaseroom', {'caseroom':this.cr_id})
                .then(()=> {
                    this.$emit('CaseRoomLeft')
                })
            },

            remove_member: function(member){
                this.$store.dispatch('caseroom/removeUserFromCaseroom', {'caseroom':this.cr_id, 'user':member})
                .then(()=> {
                    this.$emit('CaseRoomLeft')
                })
            },

            critem_onuserselected: function (payload) {
               this.$store.dispatch('caseroom/addUserToCaseroom', {'caseroom':this.cr_id, 'user':payload})
                .then(()=> {
                    this.$emit('CaseRoomChanged')
                }).finally(()=> this.adduserdialog=false)
            },
        },
        props: {
            omit_btns:Boolean,
            cr_id:null
        },
    };
</script>