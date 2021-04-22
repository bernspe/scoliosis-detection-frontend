<template>
    <v-col class="CrItem"
            cols="12"
        sm="6">

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
            <v-card-title>Betrifft: {{contents.title}}</v-card-title>
            <v-card-subtitle>Eigentümer: {{getParticipantFullname(contents.owner)}}</v-card-subtitle>
            <v-card-subtitle>Erstellt am: {{contents.created}}</v-card-subtitle>
            <v-card-subtitle>Verfällt am: {{contents.expires}}</v-card-subtitle>
            <v-list subheader
            v-if="contents.members.length > 0">
                <v-subheader>Mitglieder</v-subheader>
                  <v-list-item
                          v-for="member in contents.members"
                    :key="member"
                  >
                      <v-list-item-content
                      v-if="member">
                          <v-list-item-title v-text="getParticipantFullname(member)"></v-list-item-title>
                          <v-list-item-subtitle v-text="getParticipantRole_DE(member)"></v-list-item-subtitle>
                        </v-list-item-content>
                  </v-list-item>
            </v-list>
                 </router-link>
            <v-card-actions>
                <v-btn v-if="contents.owner==getterUserObject.username"
                @click="delCaseRoom"
                color="red"
                outlined
                >Löschen
                <v-icon
                    right
                    dark
                  >
                    mdi-delete
                  </v-icon>
                </v-btn>

                <v-btn v-else
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


            </v-card-actions>
        </v-card>

    </v-col>
</template>

<script>
    import {mapGetters} from "vuex";


    export default {
        computed: {
            ...mapGetters("caseroom", ['getParticipantFullname','getParticipantRole_DE']),
            ...mapGetters("auth", ['getterUserObject']),

            hasnews () {
                const user=this.$store.getters['auth/getterUsernameSimple']
                return this.contents.news_for_participants.includes(user)
            }
        },
        mounted() {
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
            }
        },
        props: {
            contents: Object,
            cr_id:null
        },
    };
</script>