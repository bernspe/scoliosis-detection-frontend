<template>
    <v-container>
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
                        Username: {{ item.username }}
                          <v-list>
                              <v-list-item
                                      v-for="k in detailkeys"
                              :key="k">
                                  <v-list-item-content>
                                      <v-list-item-title>{{k}}</v-list-item-title>
                                  <v-list-item-subtitle>{{item[k]}}</v-list-item-subtitle>
                                  </v-list-item-content>
                              </v-list-item>
                          </v-list>
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

                        <template v-slot:item.actions="{ item }">
                          <v-icon
                            small
                            class="mr-2"
                            @click="showItemProof(item)"
                          >
                            mdi-book-account-outline
                          </v-icon>

                  </template>

                    </v-data-table>
                  </div>

            </v-col>

        </v-row>
        <v-row>
            <v-list>
                <v-subheader>
                    Proofs for {{ userproof_name }}
                </v-subheader>
                <v-subheader>
                    Requested roles {{ userproof_roles }}
                </v-subheader>
                <v-list-item
                v-for="upr in userproofs"
                :key="upr.id">
                    <v-list-item-content>

                        <v-list-item-title>
                             <v-badge
                                value="4"
                                :color="getColorFromCheckedStatus(upr)"
                         >
                            {{ upr.proof_type }}
                             </v-badge>
                        </v-list-item-title>

                        <v-list-item-subtitle>
                            {{ upr.id }}
                        </v-list-item-subtitle>
                        <v-divider></v-divider>

                        <v-img
                              :src="getBaseUrl+upr.img"
                              :width="width"
                              contain
                        ></v-img>

                        <v-divider></v-divider>
                        <v-slider
                              v-model="width"
                              class="align-self-stretch"
                              min="50"
                              max="500"
                              step="1"
                            ></v-slider>
                        <div v-show="!upr.checkedby">
                        <v-btn
                          class="ma-2"
                          outlined
                          color="indigo"
                          @click="validateProof(upr)"
                        >
                          Validate Proof
                        </v-btn>
                        <v-btn
                          class="ma-2"
                          outlined
                          color="red"
                          @click="reject=true"
                        >
                          Reject Proof
                        </v-btn>
                            <v-row v-show="reject">
                                <v-col cols="12">
                                  <v-text-field
                                          ref="messagefield"
                                    v-model="message"
                                    append-outer-icon="mdi-send"
                                    filled
                                    clear-icon="mdi-close-circle"
                                    clearable
                                    label="Give the User an explanation for Rejection"
                                    type="text"
                                    @click:append-outer="sendMessage(upr)"
                                    @click:clear="clearMessage"
                                  ></v-text-field>
                                </v-col>
                            </v-row>

                        </div>
                    </v-list-item-content>
                </v-list-item>
                <v-btn
                          class="ma-2"
                          outlined
                          color="indigo"
                          @click="validateUser(userproof_username,'VALIDATED',false)"
                        >
                          Validate User
                </v-btn>
                <v-btn
                          class="ma-2"
                          outlined
                          color="indigo"
                          @click="validateUser(userproof_username,'VALIDATED',true)"
                        >
                          Validate Staff Member
                </v-btn>
                <v-btn
                          class="ma-2"
                          outlined
                          color="red"
                          @click="validateUser(userproof_username,'NONPROVEN', false)"
                        >
                          Revoke Validation
                </v-btn>

            </v-list>
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
    import axios from "axios";
    import InviteUser from "@/components/CaseRoom/InviteUser";


    export default {
        components: {InviteUser},
        props: {
        },
        data () {
              return {
                  width: 50,
                  expanded: [],
                search: '',
                  message:'',
                users: [],
                  snackbar: false,
                snackbar_text:"",
                  userproofs: [],
                  userproof_name:'',
                  userproof_username:'',
                  userproof_roles:'',
                  reject: false,
                  boolitems: ['is_active','is_staff','is_emailvalidated'],
                detailkeys: ['date_of_birth','sex','date_joined','last_login','expires','proofstatus','groups','user_permissions']
              }
            },
            computed: {
             getBaseUrl() { return this.$store.state.endpoints.baseUrl.slice(0,-1) },
              headers () {
                return [
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
                    { text: 'Rollen', value: 'roles' },
                    { text: 'ProofStatus', value: 'proofstatus' },
                    { text: 'isActive', value: 'is_active' },
                    { text: 'isStaff', value: 'is_staff' },
                    { text: 'isEmailValidated', value: 'is_emailvalidated' },
                    { text: '', value: 'data-table-expand' },
                    { text: 'Actions', value: 'actions', sortable: false },
                ]
              },

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

                showItemProof: function(item) {
                   var config = {
                            method: 'POST',
                            url: this.$store.state.endpoints.baseUrl+'userproof/retrieve_user_proof/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                            data: {'user':item.username}
                        };
                    axios(config).then((response)=>{
                        this.userproofs = response.data;
                        this.userproof_name = item.first_name+ ' '+item.last_name;
                        this.userproof_roles = item.roles;
                        this.userproof_username=item.username;
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
                validateProof: function(item) {
                   var config = {
                            method: 'POST',
                            url: this.$store.state.endpoints.baseUrl+'userproof/'+item.id+'/validate_proof/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config).then((response)=>{
                        console.log(response)
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
                rejectProof: function(item) {
                   var config = {
                            method: 'DELETE',
                            url: this.$store.state.endpoints.baseUrl+'userproof/'+item.id+'/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config).then((response)=>{
                        this.userproofs = response.data;
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
                      sendMessage (item) {
                        this.rejectProof(item)
                         this.$store.dispatch('auth/eMailUser',{
                             username:item['referring_User'],
                            subject: 'Nachweis nicht akzeptiert und gelöscht.',
                            message: this.message})
                          .then((response)=> {
                              this.$refs.messagefield.label=response.data
                          }).catch((e)=> {
                              console.log(e)
                         })
                          this.clearMessage()
                          this.reject=false
                      },
                      clearMessage () {
                        this.message = ''
                      },

                validateUser: function(username,status,is_staff) {
                   var config = {
                            method: 'PATCH',
                            url: this.$store.state.endpoints.baseUrl+'users/'+username+'/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                            data: {'proofstatus':status,'is_staff':is_staff},
                        };
                    axios(config).then((response)=>{
                        console.log(response)
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
        refreshUserTable: function() {
            this.$store.dispatch('auth/getUserProfiles')
            .then((response)=> {
                this.users=response
            }).catch((e)=> {
                console.log(e)
            })
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
            this.$store.dispatch('auth/getUserProfiles')
            .then((response)=> {
                this.users=response
            }).catch((e)=> {
                console.log(e)
            })
        },
    };
</script>
