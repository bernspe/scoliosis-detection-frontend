<template>
    <v-card>
        <v-progress-linear
      indeterminate
      color="cyan"
      v-if="$asyncComputed.user.updating"
        >
           </v-progress-linear>
        <v-card-title> {{ apiUserDetails.first_name }}</v-card-title>
        <v-card-subtitle> User - ID (username) : {{ username }}</v-card-subtitle>
        <v-card-text>
            <v-row dense v-if="apiUserDetails.helpdesk_caseroom_waiting ? apiUserDetails.helpdesk_caseroom_waiting.length>0 : null">
                <v-col>
                    <v-card-subtitle>Der Benutzer hat offene Fragen</v-card-subtitle>
                </v-col>
                <v-col>
                    <v-btn outlined color="primary" @click="move2HelpDesk">Zum Helpdesk-Caseroom gehen</v-btn>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col v-for="k in userdef1" :key="k">
                    <v-text-field :label="k" v-model="apiUserDetails[k]"
                                  :append-outer-icon="changingval===k ? 'mdi-pencil' : null"
                                  @click:append-outer="updateVal(k)"
                                    @input="changingval=k"
                                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col v-for="k in userdef2" :key="k">
                    <v-text-field :label="k" :value="apiUserDetails[k]"></v-text-field>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col>
                    <v-btn outlined color="primary" @click="dbivalidationopen=!dbivalidationopen">Benutzervalidierung</v-btn>
                    <Dbivalidation v-if="dbivalidationopen"
                                   :username="username"
                                   :userproofs="apiUserDetails.proofs"
                                   :userproof_name="apiUserDetails.first_name + ' ' + apiUserDetails.last_name"
                                   :userproof_roles="apiUserDetails.roles"
                                   :userproof_status="apiUserDetails.proofstatus"
                  ></Dbivalidation>
                </v-col>

            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-row dense>
                <v-col>
                    <v-btn v-if="apiUserDetails.is_active" outlined color="error" @click="toggleUserActivation({'username':username})">User deaktivieren</v-btn>
                    <v-btn v-else outlined color="success" @click="toggleUserActivation({'username':username})">User wieder aktivieren</v-btn>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    import Dbivalidation from "@/components/Dashboard/UserDashboardItem/DBIValidation";
    import {mapActions} from "vuex";
    export default {
        name: 'Userdashboarditem',
        components: {Dbivalidation},
        props: ['username'],
        data: () => {
            return {
                userdef1: ['first_name','last_name','email','date_of_birth','sex'],
                userdef2: ['date_joined','last_login','expires'],
                userdef3: ['postal_address'],

                changingval:null,
                apiUserDetails:{},

                dbivalidationopen: false,
            }
        },
        asyncComputed: {
            user: {
                get() {
                    var this1=this
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (this1.username) {
                                this1.$store.dispatch('auth/getAccountDetailsOfSpecificUser',this1.username)
                                .then((res) => {
                                    this.apiUserDetails=Object.assign(this.apiUserDetails,res)
                                    resolve(res)
                                })
                                .catch((e) => reject(e))
                            } else reject()
                        }, 1000)
                    })
                },
                default: {'first_name':'', 'username':''},
                watch: ['username']
            }
        },
        methods:{
            ...mapActions('auth',['toggleUserActivation']),
            updateVal: function(k){
                console.log('Updating ',k, ' with val ',this.apiUserDetails[k] )
                this.$store.dispatch('auth/updateAccountDetailsOtherUser',{'username': this.username, [k]:this.apiUserDetails[k]})
                .then((res)=> {
                    this.apiUserDetails=res.data
                    this.changingval = null
                })
            },
            move2HelpDesk: function() {
                var hd=this.apiUserDetails['helpdesk_caseroom_waiting'][0]
                this.$router.push('/caseroom/'+hd)
            }
        },

    };
</script>
