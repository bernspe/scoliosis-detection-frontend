<template>
    <v-container>
           <v-progress-linear
      indeterminate
      color="cyan"
      v-if="$asyncComputed.users.updating"
        >
           </v-progress-linear>

        <v-row>
            <InviteUser
            label="Teilnehmer einladen"
            population="list-all"
            @userInvited="onUserInvited"></InviteUser>
        </v-row>
        <v-row>
            <v-btn
            @click="refreshUserTable">
                Refresh User Table
            </v-btn>
        </v-row>
        <v-row>
            <v-col
            cols="12">
                  <div>
                    <v-data-table
                      :headers="headers"
                      :items="users"
                      item-key="username"
                      class="elevation-1"
                      :search="search"
                      :custom-filter="filterOnlyCapsText"
                      single-expand
                        :expanded.sync="expanded"
                      show-expand
                    >
                      <template v-slot:top>
                        <v-text-field
                          v-model="search"
                          label="Search (lower CASE ONLY)"
                          class="mx-4"
                        ></v-text-field>
                      </template>
                    <template v-slot:expanded-item="{ headers, item }">
                      <td :colspan="headers.length">
                          <Userdashboarditem v-if="!item.is_superuser" :username="item.username"></Userdashboarditem>

                      </td>
                    </template>
                        <template v-slot:item.proofstatus="{ item }">
                          <v-chip
                            :color="getColorProofstatus(item.proofstatus)"
                            dark
                          >{{ item.proofstatus }}
                          </v-chip>
                        </template>

                        <template v-slot:item.is_active="{ item }">
                          <v-chip
                            :color="getColor(item.is_active)"
                            dark
                          >{{ item.is_active }}
                          </v-chip>
                        </template>

                        <template v-slot:item.is_staff="{ item }">
                          <v-chip
                            :color="getColor(item.is_staff)"
                            dark
                          >{{ item.is_staff }}
                          </v-chip>
                        </template>

                        <template v-slot:item.is_emailvalidated="{ item }">
                          <v-chip
                            :color="getColor(item.is_emailvalidated)"
                            dark
                          >{{ item.is_emailvalidated }}
                          </v-chip>
                        </template>

                        <template v-slot:item.helpdesk_caseroom_waiting="{ item }">
                          <v-chip
                            color="yellow"
                            dark
                            v-if="item.helpdesk_caseroom_waiting.length>0"
                          > HD
                          </v-chip>
                        </template>

                    </v-data-table>
                  </div>

            </v-col>

        </v-row>


        <v-snackbar
      v-model="snackbar"

    >
      {{ snackbar_text }}
                        <template v-slot:action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          OK
        </v-btn>
      </template>
          </v-snackbar>
    </v-container>
</template>

<script>

    import InviteUser from "@/components/CaseRoom/InviteUser";

    import Userdashboarditem from "@/components/Dashboard/UserDashboardItem/UserDashboardItem";


    export default {
        components: {Userdashboarditem, InviteUser},
        props: {
        },
        data () {
              return {
                  expanded: [],
                search: '',
                  snackbar: false,
                snackbar_text:"",
                  boolitems: ['is_active','is_staff','is_emailvalidated'],

              }
            },
            computed: {

              headers () {
                return [
                  { text: '', value: 'data-table-expand' },
                    {
                    text: 'Vorname',
                    align: 'start',
                    sortable: false,
                      value: 'first_name'
                  },
                  {
                    text: 'Nachname',
                    sortable: true,
                    value: 'last_name',
                  },

                  { text: 'eMail', value: 'email' },
                    {text: 'Date Joined', value: 'date_joined', sortable:true},
                    { text: 'Rollen', value: 'roles' },
                    { text: 'ProofStatus', value: 'proofstatus' , sortable:true},
                    { text: 'isActive', value: 'is_active' },
                    { text: 'isStaff', value: 'is_staff' },
                    { text: 'isEmailValidated', value: 'is_emailvalidated' },
                    { text: 'Helpdesk', value: 'helpdesk_caseroom_waiting'},
                ]
              },

            },
        asyncComputed: {
          users: {
              get() {
                  return new Promise((resolve, reject) => {
                      setTimeout(() => {
                          this.$store.dispatch('auth/getUserProfiles')
                                .then((response)=> {
                                    resolve(response)
                                }).catch(()=> {
                                    reject()
                                })
                      }, 1000)
                  })
              },
              default: []
          }
        },
            methods: {
              getColorFromCheckedStatus(item) {
                if (item.checkedby)  {
                    return 'green'
                } else {
                    return 'red'
                }
              },
              filterOnlyCapsText (value, search) {
                return value != null &&
                  search != null &&
                  typeof value === 'string' &&
                  value.toString().toLocaleLowerCase().indexOf(search) !== -1
              },
              getColor (status) {
                if (status) return 'green'
                else return 'red'
              },
              getColorProofstatus (status) {
                if (status=='INVITED') return 'yellow'
                if (status=='NONPROVEN') return 'orange'
                if (status=='VALIDATED') return 'green'
                return 'grey'
              },


        refreshUserTable: function() {
            this.$asyncComputed.users.update()
        },
       onUserInvited(payload){
            if (payload.user=='pdf'){
                this.snackbar_text="Du erhältst nun die pdf Datei für "+payload.name+". Schickst Du Sie ihm?"
            } else {
                this.snackbar_text="Es wurde eine Email an "+payload.name+" gesendet."
            }
            this.snackbar=true
        }

            },
        mounted() {

        },
    };
</script>
