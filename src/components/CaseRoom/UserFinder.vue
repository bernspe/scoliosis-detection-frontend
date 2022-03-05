<template>
    <v-card class="ma-2 pa-2">
        <v-row>
                <v-col cols="6">
                    <v-card-title >
                        Person finden...
                    </v-card-title>
                    <v-card-subtitle>
                        {{ userTypes[typeOfUser] }}
                    </v-card-subtitle>
                </v-col>

                <v-col cols="6" class="d-flex child-flex" id="tracer_userfinder_typeofuserselector">

                    <v-sheet
                        class="ma-2"
                      color="white"
                      :elevation="typeOfUser < 3 ? 1 : 4"
                      max-height="100"
                        max-width="100"
                      rounded
                    ><v-img v-show="isMed" width="96" height="96" src="../../assets/family-black.svg" @click="typeOfUser=getUserType"></v-img>
                    <v-img v-show="isChild" width="96" height="96" src="../../assets/family-child-black.svg" @click="typeOfUser=getUserType"></v-img>
                        <v-img v-show="isCaregiver" width="96" height="96" src="../../assets/family-child-red.svg" @click="typeOfUser=getUserType"></v-img>
                    </v-sheet>

                    <v-sheet
                            class="ma-2"
                      color="white"
                      :elevation="typeOfUser >2 ? 1 : 4"
                      max-height="100"
                      max-width="100"
                      rounded
                    ><v-img width="96" height="96" src="../../assets/doctor-img.svg"
                    @click="typeOfUser=3"></v-img></v-sheet>

                </v-col>

         </v-row>
        <v-row>
            <v-col v-show="typeOfUser<2">
                <Userselector3
                @usernotfound="onusernotfound" @userselected="onuserselected" id="userselector3id"></Userselector3>
            </v-col>
            <v-col v-show="typeOfUser===2">
                       <v-card>
                            <DepChildrenCollection load-children returnchild
                            :passed_email="notfound_user.email ? notfound_user.email : ''"
                            :passed_firstname="notfound_user.firstname ? notfound_user.firstname : ''"
                            :passed_lastname="notfound_user.lastname ? notfound_user.lastname : ''"
                            :passed_birthday_date="notfound_user.birthday_date ? notfound_user.birthday_date : ''"
                            @userselected="onuserselected"></DepChildrenCollection>
                       </v-card>
            </v-col>
            <v-col v-show="typeOfUser===3">
                <Userselector4 @userselected="onuserselected" @userunselected="remove_selected_user"></Userselector4>
            </v-col>
        </v-row>

        <v-card-text>
            <v-chip-group id="tracer_userfinder_selectedusersgroup">
                    <v-menu
                      v-model="u.menu"
                      :close-on-content-click="false"
                      :nudge-width="200"
                      offset-x
                      v-for="(u,idx) in selected_users"
                        :key="u.username"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip-group column>
                                  <v-chip class="ma-2" outlined close

                                :color="get_color_from_status(selected_ages[idx],u.roles ? u.roles.includes('Child') : false,selected_has_caregiver[idx])"
                                @click:close="remove_selected_user(u.username)"
                                v-bind="attrs"
                                v-on="on"
                                >
                                    {{ u.name ? u.name : u.first_name + ' ' + u.last_name }}
                                    <v-icon left v-if="missing_caregiver_in_selected_childs[idx]">
                                        mdi-account-alert-outline
                                     </v-icon>
                                </v-chip>
                            </v-chip-group>
                      </template>

                        <v-card>
                            <v-card-text>
                            <v-list three-line subheader>
                                <v-subheader>Benutzer</v-subheader>
                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title> {{ u.name }}</v-list-item-title>
                                        <v-list-item-subtitle v-if="u.date_of_birth"> {{ Date.parse(u.date_of_birth).toString('d.M.yyyy') }}</v-list-item-subtitle>
                                        <v-list-item-subtitle> {{ u.email }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                            <v-divider></v-divider>
                            <v-list three-line subheader v-if="u.roles ? u.roles.includes('Child'): false">
                                <v-subheader v-if="potential_caregivers.length>0">Eltern für {{ u.first_name }} auswählen</v-subheader>
                                <v-subheader v-else>Bitte suche noch einen Elternteil für {{ u.first_name }}.</v-subheader>
                                <v-list-item-group
                                        v-if="potential_caregivers.length>0"
                                        v-model="u.list_caregiver"
                                    multiple
                                    active-class=""
                                  >
                                    <template v-for="(item, i) in potential_caregivers">
                                    <v-list-item
                                            :key="`item-${i}`"
                                            :value="item"
                                              active-class="deep-purple--text text--accent-4"
                                           >
                                        <template v-slot:default="{ active }">
                                            <v-list-item-content>
                                                <v-list-item-title> {{ item.name }}</v-list-item-title>
                                                <v-list-item-subtitle> {{ item.email }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-checkbox
                                                  :input-value="active"
                                                  color="deep-purple accent-4"
                                                ></v-checkbox>
                                              </v-list-item-action>
                                        </template>
                                    </v-list-item>
                                    </template>
                                </v-list-item-group>

                                <v-list-item-group v-else>
                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-btn color="success" outlined @click="focusUserSelector3(u)">
                                                Nutzer suchen
                                            </v-btn>
                                        </v-list-item-action>
                                        <v-list-item-action>
                                                <InviteUser label="Neu anlegen" caregiver clearonmount
                                                @userInvited="onUserInvited" @userDenied="onUserDenied"></InviteUser>
                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="success" outlined @click="addcaregivers(u)" :disabled="u.list_caregiver ? u.list_caregiver.length===0 : true">OK</v-btn>
                                <v-btn color="red" outlined @click="u.menu=false">Abbrechen</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
            </v-chip-group>
        </v-card-text>
        <v-card-actions>
            <v-btn color="success" outlined @click="transfer_users"
            :disabled="missing_caregiver_in_selected_childs.includes(true)">OK</v-btn>
            <v-btn color="red" outlined @click="cancel_userfind">Abbrechen</v-btn>
                <InviteUser label="Neuen Benutzer anlegen"
                            @userInvited="onUserInvited" @userDenied="onUserDenied"></InviteUser>

        </v-card-actions>
        <v-tour name="UserfinderTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </v-card>
</template>

<style>
    .v-card__text, .v-card__title {
  word-break: normal; /* maybe !important  */
}
</style>

<script>
    import InviteUser from "@/components/CaseRoom/InviteUser";
    import Userselector3 from "@/components/CaseRoom/UserSelector3";
    import Userselector4 from "@/components/CaseRoom/UserSelector4";
    import {mapGetters} from "vuex";
    import DepChildrenCollection from "@/components/Account/DepChildrenCollection";
    require('datejs');
    Date.i18n.setLanguage('de-DE');
    import Vue from 'vue';
    import component_tracer from "@/mixins/component_tracer";

    export default {
        name: 'Userfinder',
        mixins: [component_tracer],
        components: {DepChildrenCollection, Userselector3, Userselector4,InviteUser},
        data() {
            return {
                userTypes: ['Patient oder Angehöriger', 'Meine Eltern', 'Mein Kind', 'Mediziner'],
                typeOfUser: 0,
                notfound_user: {},
                selected_users:[],
            }
        },
        computed: {
            ...mapGetters('auth',['getterDependentChildren','getterMyPatients','isCaregiver','isMed','isChild','getterUsernameSimple']),
            getUserType () {
                    if (this.isChild) {
                        return 1
                    }
                    if (this.isCaregiver) {
                        return 2
                    }
                    return 0
            },
            selected_usernames () {
                return this.selected_users.map((x) => x.username)
            },
            selected_ages (){
                var today = new Date.today();
                return this.selected_users.map((x) => {
                    if (x.date_of_birth) {
                        const bd = new Date(x.date_of_birth)
                        const diffTime = Math.abs(today - bd)
                        const diffYears = Math.ceil(diffTime / (1000 * 3600 * 24*365));
                        return diffYears
                    } else return null
                })
            },
            selected_has_caregiver() {
                return this.selected_users.map((x) => Object.hasOwnProperty.call(x,'caregiver') ? x.caregiver.length > 0 : false)
            },
            missing_caregiver_in_selected_childs() {
                return this.selected_users.map((x) => {
                    if (x.roles.includes('Child')) {
                        if (!(x['caregiver'])) return true
                        else return !(x.caregiver.some(r => (this.selected_usernames.includes(r)) || (this.getterUsernameSimple === r)))
                    } else {
                        return false
                    }
                })
            },
            potential_caregivers() {
              return this.selected_users.filter((x) => x.roles.includes('Caregiver') || x.roles.includes('Adult'))
            },

        },
        mounted() {
            this.selected_users=[]
            this.notfound_user={}
            if (this.isMed) {
                this.typeOfUser=0
            }
            if (this.isCaregiver) {
                this.typeOfUser=2
            }
            if (this.isChild) {
                this.typeOfUser=1
            }
        },
        methods: {
            onusernotfound: function(payload) {
                this.notfound_user=payload
            },
            onuserselected: function(payload) {
              //  if (!this.selected_usernames.includes(payload.username)) {
                    this.selected_users.push(payload)
                    if (!this.isCaregiver) {
                        if (payload.roles.includes('Child')) {
                            payload.caregiver.forEach((x) => {
                                this.$store.dispatch('auth/getAccountDetailsOfSpecificUser', x)
                                    .then((res) => this.selected_users.push(res))
                            })
                        }
                    }
              //  }
            },
            onUserInvited: function(payload) {
                console.log('User Invited received ', payload)
                if (!this.selected_usernames.includes(payload.username)) {
                    this.selected_users.push({username:payload.username}) // this is to prevent the second InviteUser Component from entering
                    //if (Object.prototype.hasOwnProperty.call(payload,'mode')) {
                        // if the call came from invitation
                        this.$store.dispatch('auth/getAccountDetailsOfSpecificUser',payload.username)
                        .then((res) => {
                            this.selected_users.pop()
                            this.selected_users.push(res)
                        })
                    //} else this.selected_users.push(payload)
                }
            },
            onUserDenied(payload) {
              console.log('User denied invitation: ',payload.name)
            },
            remove_selected_user: function(item){
                let i=this.selected_usernames.indexOf(item)
                const u = this.selected_users[i]
                if (u.caregiver.length>0) {
                    u.caregiver.forEach((x) => {
                        var ic = this.selected_usernames.indexOf(x)
                        this.selected_users.splice(ic,1)
                    })
                    i=this.selected_usernames.indexOf(item)
                }
                this.selected_users.splice(i,1)
            },

            transfer_users: function() {
                this.$emit('userfinder_userselected',this.selected_users)
            },
            cancel_userfind: function() {
                this.$emit('userfinder_userselected',[])
            },
            get_color_from_status: function(age, isChild, hasCaregiver) {
              if (age) {
                  if ((age > 17) || (!isChild)) return 'blue'
                  else {
                      if (hasCaregiver) return 'purple'
                      else return 'red'
                  }
              }  else {
                  return 'grey'
              }
            },
            focusUserSelector3: function(u) {
                u.menu=false
                document.getElementById("us3inputfield").focus()
            },
            addcaregivers: function(childuser) {
                const child = childuser.username
                const caregivers = childuser.list_caregiver.map((x) => x.username)
                var this1=this
                this.$store.dispatch('auth/addCaregiversToChild',{'child_username': child,
                        'caregiver_usernames': caregivers})
                        .then((result) => {
                            result.forEach((x) => {
                                var i= this1.selected_users.findIndex(item => item.username === x.username)
                                if (i !== -1) {
                                      Vue.set(this1.selected_users,i, x);
                                }
                            })
                        })
                childuser.menu = false
            }
        },

    };
</script>
