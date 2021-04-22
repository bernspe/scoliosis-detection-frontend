<template>
    <v-container class="CaseRoomForum"
    justify="center">
               <v-row
               justify="space-around">
                   <h1>Diskussionsräume von  {{getterFirstname}}</h1>
               </v-row>
                <v-row
                justify="space-around"
                class="mb-6">

                   <CrItem v-for="(entry,id) in getUserCaseRooms"
                           :contents="entry"
                           :key="id"
                           :cr_id="id"
                            @CaseRoomDeleted="onCaseRoomDeleted"
                           @CaseRoomLeft="onCaseRoomLeft"
                   />

               </v-row>

        <v-row>
                <CrCreateDialog
                        v-if="isCaregiver"
                @CaseRoomCreated="onCaseRoomCreated"></CrCreateDialog>

        </v-row>

            </v-container>


</template>

<script>
    import CrItem from "@/components/CaseRoom/CaseRoomItem";
    import CrCreateDialog from "@/components/CaseRoom/CaseRoomCreate";

    import {mapGetters} from "vuex";
    export default {
        components: {CrItem, CrCreateDialog},
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname','isCaregiver']),
            ...mapGetters("caseroom", ['getUserCaseRooms']),
        },
        mounted() {
            this.loadCaseRooms()
        },
        methods: {
          loadCaseRooms: function () {
            this.$store.dispatch('caseroom/loadUserCaseRooms')
                .then((result) => {
                    const ms = result.data.map(o => o.members);
                    const os = result.data.map(o => o.owner);
                    const unique_ms = [...new Set(ms.flat(1).concat(os.flat(1)))]
                    this.$store.dispatch('auth/getMinimalUserProfiles', {'usernames':unique_ms})
                    .then((result)=> {
                        this.$store.commit('caseroom/setParticipants',result)
                    })
                    //this.$store.commit('caseroom/setUserCaseRooms',result.data)
                })
                .catch((e) => {
                    console.log(e)
                })

          }  ,
            onCaseRoomCreated: function () {
              this.loadCaseRooms()

            },
            onCaseRoomDeleted: function () {
              this.loadCaseRooms()
            },
            onCaseRoomLeft: function () {
              this.loadCaseRooms()
            }
        },
        data: () => ({

        }),
        props: {
           // id: String,
        },
    };
</script>
