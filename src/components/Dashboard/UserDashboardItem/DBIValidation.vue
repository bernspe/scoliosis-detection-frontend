<template>
            <v-row>
                <v-card>
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

                        <AuthImg
                              :src="getBaseUrl+upr.img"
                              :auth="getterAuthToken"
                              :width="width"
                              :contain="true"
                              :imgonly="true"
                        ></AuthImg>

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
                                    @click:append-outer="rejectProof(upr)"
                                    @click:clear="clearMessage"
                                  ></v-text-field>
                                </v-col>
                            </v-row>

                        </div>
                    </v-list-item-content>
                </v-list-item>
                 </v-list>
                <v-card-title>
                    Current status: <v-chip
                            :color="getColorProofstatus(userproof_status)"
                            dark
                          >{{ userproof_status }}
                          </v-chip>
                </v-card-title>
                <v-card-actions>
                <v-btn  v-if="isStaff"
                          class="ma-2"
                          outlined
                          color="indigo"
                          @click="validateUser(username,'VALIDATED',false)"
                        >
                          Validate User
                </v-btn>
                <v-btn  v-if="isAdmin"
                          class="ma-2"
                          outlined
                          color="indigo"
                          @click="validateUser(username,'VALIDATED',true)"
                        >
                          Validate Staff Member
                </v-btn>
                <v-btn  v-if="isStaff"
                          class="ma-2"
                          outlined
                          color="red"
                          @click="validateUser(username,'NONPROVEN', false)"
                        >
                          Revoke Validation
                </v-btn>
                </v-card-actions>

                    </v-card>
        </v-row>
</template>

<script>
    import {mapGetters} from "vuex";
    import axios from "axios";
    import AuthImg from "@/components/AuthImg";

    export default {
        name: 'Dbivalidation',
        components: {AuthImg},
        props: ['username','userproof_name','userproof_roles','userproof_status'],
        data ()  {
            return {
                width: 50,
                userproofs:[],
                message:'',
                reject: false,
            }

        },

        computed: {
            ...mapGetters(['getterAuthToken']),
            ...mapGetters('auth',['isStaff','isAdmin']),
            getBaseUrl() {
                return this.$store.state.endpoints.baseUrl.slice(0, -1)
            },
        },
        mounted() {
          this.showItemProof()
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
                if (status==='INVITED') return 'yellow'
                if (status==='NONPROVEN') return 'orange'
                if (status==='VALIDATED') return 'green'
                return 'grey'
              },

                showItemProof: function() {
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
                            data: {'user': this.username}
                        };
                    axios(config).then((response)=>{
                        this.userproofs = response.data;
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
                            method: 'POST',
                            url: this.$store.state.endpoints.baseUrl+'userproof/'+item.id+'/reject_proof/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                            data: {message: this.message}
                        };
                    axios(config).then((response)=> {
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

        }

    };
</script>
