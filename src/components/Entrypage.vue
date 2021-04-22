<template>
   <v-container>
    <v-container v-if="!isAuthenticated">
        <Appetizer></Appetizer>
    </v-container>


    <v-container v-if="isAuthenticated">
                    <ConsentForm
                        v-if="showconsentform"
                        consent_type="P0"
                          @consentdecision="onConsentDecision"
                        >
                        </ConsentForm>

            <v-card
            v-if="stillToDo">
                <v-card-title>
                    Wichtig
                </v-card-title>
                <v-card-subtitle>
                    Folgende Punkte solltest du noch bearbeiten, damit wir dich als gültigen Nutzer eintragen können!
                </v-card-subtitle>
                 <v-list three-line>
                  <template v-for="(item,index) in items">
                    <v-list-item
                       v-if="item.condition"
                      :key="item.title"

                    >

                      <v-list-item-content >
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                        <v-list-item-subtitle v-html="item.subtitle"></v-list-item-subtitle>

                        <v-component v-bind="item.params"
                                     v-on="item.events"
                                     :is="item.component" class="pa-2"></v-component>

                      </v-list-item-content>
                    </v-list-item>
                      <v-divider
                        v-if="index < (items.length - 1)"
                        :key="index"
                      ></v-divider>
                  </template>
                </v-list>

                <v-card-actions>
                           <v-btn

                          color="blue-grey"
                          class="ma-2 white--text"
                          @click="updateUser"
                        >
                          Daten aktualisieren
                          <v-icon
                            right
                            dark
                          >
                            mdi-cloud-upload
                          </v-icon>
                        </v-btn>
                </v-card-actions>

            </v-card>


            <v-card v-if="!stillToDo&isStaff">
                <v-card-title>
                    Mitarbeiterbereich
                </v-card-title>
                <v-card-subtitle>
                    Willkommen zurück.
                </v-card-subtitle>
            </v-card>


            <v-card v-if="!stillToDo&isNonValidatedUser">
                <v-card-title>
                    Wartebereich
                </v-card-title>
                <v-card-subtitle>
                    Du hast nun alle Aufgaben erfüllt. Wir müssen nun Deine Angaben überprüfen. Dann wird Dein Konto freigeschaltet. Bitte gib uns dafür einen Tag Zeit.
                </v-card-subtitle>
                <v-card-actions>
                    <v-btn @click="reFetchUser">Status aktualisieren</v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-if="!stillToDo&isValidatedUser">
                <v-card-title>
                    Benutzerbereich
                </v-card-title>
                <v-card-subtitle>
                    Alle Anforderungen erfüllt. Dein Benutzerkonto wurde validiert.
                </v-card-subtitle>
            </v-card>

              <v-card v-if="!stillToDo&isValidatedUser&isCaregiver">
                  <v-card-title>Eigene Kinder</v-card-title>

                   <DepChildrenCollection
                           v-if ="getterUserObject"
                           load-children
                   @childAdded="getChildrenDetails(getterUserObject)"
                 >
                </DepChildrenCollection>
              </v-card>

            <v-snackbar
      v-model="snackbar"
        timeout="2000"
    >
      {{ snackbar_text }}


          </v-snackbar>

        </v-container>

</v-container>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";

    import NewPasswordDialog from "@/components/Account/NewPasswordDialog";
    import RoleSelector2 from "@/components/Account/RoleSelector2";
    import BirthdayPicker from "@/components/Account/BirthdayPicker";
    import ProofCollection from "@/components/Account/ProofCollection";
    import MissingConsentGroup from "@/components/ConsentForm/MissingConsentGroup";
    import axios from "axios";
    import IntroTour from "@/components/IntroTour/IntroTour";
    import ChangeEmailField from "@/components/Account/ChangeEmailField";
    import Appetizer from "@/components/IntroTour/Appetizer";
    import ConsentForm from "@/components/ConsentForm/ConsentForm";
    import DepChildrenCollection from "@/components/Account/DepChildrenCollection";


    export default {

        components: {
            Appetizer,
            ConsentForm,
            DepChildrenCollection,
            BirthdayPicker,
            ChangeEmailField,
            IntroTour,
            MissingConsentGroup,
            NewPasswordDialog,
            ProofCollection,
            RoleSelector2,
        },
        data: () => ({
            snackbar: false,
            snackbar_text:'',
            necc_proofs:[],
            has_defaultpassword:false,
            has_expired:false,
          consentGiven: false,
            changed_values:{},
            childrendetails:[],

    }),
        mounted() {
            if (this.isAuthenticated) {
                this.checkDef();
            }
        },
        computed: {
            ...mapGetters("auth",["isAuthenticated","getterUserObject","isStaff","isValidatedUser","isNonValidatedUser","isCaregiver"]),

            stillToDo: function() {
                const reducer = (accumulator, currentValue) => accumulator || currentValue;
              return this.items.map(x=>x.condition).reduce(reducer)
            },

            showconsentform: function () {
                return ((this.$store.getters['auth/getterUserObject'].missing.includes('hasP0consent')) & (!this.consentGiven))
            },
            items: function () {
                var user = this.getterUserObject
                var hasdefaultemail=user.email.includes('@skoliosekinder.de')
                var proofs=this.necc_proofs
                var checked=false
                return [
                    {
                        title: 'EMail',
                        condition: hasdefaultemail,
                        subtitle: 'Du musst eine gültige eigene EMail Adresse hinterlegen, damit du dich zukünftig anmelden kannst!',
                        component: ChangeEmailField,
                        events: {
                            "newEmail": () => this.message('EMail wurde neu gesetzt'),
                            "error": () => this.message('Ein Fehler ist passiert - EMail Adresse wurde nicht verändert')
                        }
                    },
                    {
                        title: 'Passwort',
                        condition: this.has_defaultpassword,
                        subtitle: 'Du musst ein Passwort vergeben, um dich zukünftig anmelden zu können!',
                        component: NewPasswordDialog,
                        params: {
                            label: 'Neues Passwort',
                            user:  user,
                        },
                        events: {
                            "updatePassword": () => this.checkDef()

                        }
                    },
                    {
                        title: 'Zugang ist veraltet',
                        condition: this.has_expired,
                        subtitle: 'Du musst dein Passwort erneuern, um weiter hier arbeiten zu können',
                        component: NewPasswordDialog,
                        params: {
                            label: 'Neues Passwort',
                            user:  user,
                        },
                        events: {
                            "updatePassword": () => this.checkDef()
                        }
                    },
                    {
                        title: 'Geburtstag',
                        condition: user.date_of_birth == null,

                        subtitle: 'Wir benötigen Dein Geburtsdatum, um Dich als Person eindeutig zuordnen zu können.',
                        component: BirthdayPicker,
                        params:{
                            "birthday_date": user.date_of_birth
                        },
                        events: {
                            "updateBirthday": (x)=> { this.changed_values['date_of_birth']= x.date},
                        },

                    },
                    {
                        title: 'Deine Funktion',
                        condition: user.roles.length == 0,
                        subtitle: 'Was sind Deine Rollen bei Skoliosekinder?',
                        component: RoleSelector2,
                        params: {
                            "value": user.roles,
                            "birthday_date": user.date_of_birth
                        },
                        events: {
                            "updateRole": (x) => {  this.necc_proofs=x.proof; this.changed_values['roles']= x.value}
                        },

                    },
                    {
                        title: 'Bescheinigungen',
                        condition: ! ((user.proofstatus=='APPROVED') | (user.proofstatus=='VALIDATED') | checked),
                        subtitle: 'Dein Account ist noch nicht bestätigt. Fehlen noch Unterlagen?',
                        component: ProofCollection,
                        params:{
                            "requestedproofs": proofs
                        },
                        events: {
                            'noMissingProofs': ()=> checked=true
                        }
                    },
                    {
                        title: 'Erklärungen',
                        condition: user.missing ? user.missing.includes('consentscomplete'): false ,
                        subtitle: 'Könntest Du Dich bitte noch mit folgenden Details befassen und Dein Einverständnis geben:',
                        component: MissingConsentGroup,
                        params:{
                            user: user,
                        },
                        events: {
                            "alldone":() => {user.missing = user.missing.filter(item => item !== 'consentscomplete')}
                        }
                    },
                    {
                        title: 'Erklärungen der Kinder',
                        condition: user.missing ? user.missing.includes('childrenconsentscomplete') : false,
                        subtitle: 'Eines oder alle deine Kinder haben noch nicht alle Einverständniserklärungen akzeptiert oder sind vom System noch nicht validiert worden. Für das Einverständnis müssen sich Deine Kinder anmelden.',
                    },
                    {
                        title: 'Einführung',
                        condition: user.missing? user.missing.includes('instruction_level'): false,
                        subtitle: 'Bitte schau Dir noch die kurze Einführung an.',
                        component: IntroTour,
                        events: {
                            "IntroFinished": ()=> this.changed_values['instruction_level']= 'BASIC'
                        }
                    },
                ] },
        },

      methods: {
            ...mapActions('auth',['reFetchUser']),
          getChildrenDetails: function(user) {
                let children=[]
              if (user) {
                  if (user['dependent_children'].length > 0) {
                      this.$store.dispatch(('auth/getDependentChildren'))
                          .then((response) => {
                              children = response;
                          }).catch((e) => {
                          console.log(e)
                      })
                  }
                  this.childrendetails = children
              }
            },
            checkDef: function() {
               var config2 = {
                            method: 'GET',
                            url: this.$store.state.endpoints.baseUrl+'check_defaultpassword/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config2).then((response2)=>{
                        this.has_defaultpassword=response2.data.defaultpassword
                        this.has_expired=response2.data.expired
                    })
            },
            onConsentDecision: function(payload) {
              if (payload)  {
                  this.consentGiven=true
              } else {
                  this.$store.dispatch('auth/logout')
              }
             },
          updateUser: function() {
             this.$store.dispatch('auth/updateAccountDetails',this.changed_values)
                .then(()=> {
                    console.log('User information updated: ',this.changed_values)
                    this.changed_values={}
                })
          },
          message: function(text) {
              this.snackbar_text=text
              this.snackbar=true
          }
      },


        props: {
            user:Object
        },

    };
</script>