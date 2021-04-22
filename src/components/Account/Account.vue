<template>
    <v-card>
        <v-card-title>Hallo {{getterFirstname}}</v-card-title>

        <v-card-subtitle>Das wissen wir über Dich</v-card-subtitle>
        <v-card-text>
    <v-list>
      <v-list-group
        v-for="item in datacollection"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.action"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="child in item.itemlist"
          :key="child.key"
        >
          <v-list-item-content>
            <v-list-item-title v-text="child.readable" v-if="child.type!='children'"></v-list-item-title>
              <!-- Show contents -->
              <v-list-item-subtitle
                      v-if="(child.type == 'text' || child.type =='email' || child.type =='multilinetext') && !child.mutate"
                      v-text="apiaccountdetails[child.key]"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                      v-if="(child.type == 'datetime' || child.type == 'date') && !child.mutate"
                      v-text="convertdt(apiaccountdetails[child.key], child.type)"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                      v-if="(child.type == 'choice') && !child.mutate"
                      v-text="choicedict[apiaccountdetails[child.key]]"
              ></v-list-item-subtitle>

              <!-- Edit contents -->
              <v-text-field
                      v-if="child.type == 'text' && child.mutate"
                      v-model="apiaccountdetails[child.key]"
              ></v-text-field>
              <v-textarea
                v-if="child.type=='multilinetext' && child.mutate"
                v-model="apiaccountdetails[child.key]"
              ></v-textarea>

              <ChangeEmailField v-if="child.type=='email' && child.mutate"
                :value="apiaccountdetails[child.key]"
              >

              </ChangeEmailField>

               <v-row
                       v-if="child.key == 'expires' && child.mutate"
                       justify="center">
                <v-date-picker
                  v-model="vanishdate"
                  type="month"
                  class="mt-4"
                  :min="convertdt(initialvanishdate,'month')"
                ></v-date-picker>

              </v-row>
              <!-- Show & Edit user role -->
                <v-list-item-subtitle
                    v-if="child.key=='roles'">
                   <RoleSelector2
                   :value="apiaccountdetails[child.key]"
                    :proofs="necessaryproofs"
                   @updateRole="onUpdateRole">
                </RoleSelector2>
                </v-list-item-subtitle>

              <div
              v-if="child.key=='dependent_children' && child.type=='children'"
              >
              <!-- Show & Edit children -->
              <v-list-item-title
               v-if= "caregiverrole"
              >Kinder</v-list-item-title>
                <v-list-item-subtitle
                v-if= "caregiverrole"
                >
                   <DepChildrenCollection
                   :children="childrendetails"
                 >
                </DepChildrenCollection>
                </v-list-item-subtitle>

              <!-- Show parent -->
                <v-list-item-title
              v-if="childrole"
              >Eltern / Erziehungsberechtigte

                </v-list-item-title>
                <v-list-item-subtitle
                v-if="childrole"
                >
                   <CaregiverItem
                 >
                </CaregiverItem>
                </v-list-item-subtitle>
              </div>
              <!-- Show & Edit user proofs -->
                <v-list-item-subtitle
                    v-if="child.key=='proofs'">
                   <ProofCollection
                   :requestedproofs="necessaryproofs"
                   >
                </ProofCollection>
                </v-list-item-subtitle>
                <!-- Show Consent Docs --->
              <v-list-item-subtitle
                v-if="child.key == 'consents'"
              >
                  <ConsentItemGroup
                  :value="consentdetails"
                  >

                  </ConsentItemGroup>
              </v-list-item-subtitle>

              <!-- Show User MD Document -->
              <v-list-item-subtitle
                  v-if="child.key=='document'">
                    <UserProfileDocument
                        :document_url="docurl"
                        :mutable="true"
                    >

                    </UserProfileDocument>
              </v-list-item-subtitle>

          </v-list-item-content>
            <v-list-item-action
               v-if="child.mutable && !child.mutate"
              >
                  <v-btn icon
                  @click="child.mutate = !child.mutate"
                  >
                    <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>

            <v-list-item-action
               v-if="child.mutable && child.mutate"
              >
                  <v-btn
                          v-if="child.key != 'expires'"
                          icon
                         @click="child.mutate = !child.mutate"
                  >
                    <v-icon color="grey lighten-1"
                    @click="showupdatebutton=true">mdi-check</v-icon>
                  </v-btn>
                <!---
                Action section for changing account expiry
                --->
                <v-btn
                          v-if="child.key == 'expires'"
                          icon
                         @click="[child.mutate,apiaccountdetails[child.key]]=setNewExpDate(child.mutate,apiaccountdetails[child.key], vanishdate)"
                  >
                    <v-icon color="grey lighten-1">mdi-check</v-icon>
                  </v-btn>


                </v-list-item-action>
        </v-list-item>
      </v-list-group>
    </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text
          @click.stop="deletedialog=true"
          >Löschen
              <v-icon
                    right
                    dark
                  >
                    mdi-delete
                  </v-icon>
          </v-btn>

            <NewPasswordDialog
             :user="getterUserObject"
             label="Neues Passwort erstellen"
            >

            </NewPasswordDialog>

             <v-btn
                     v-show="showupdatebutton"
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



   <v-dialog
      v-model="deletedialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Sollen wir deinen Account wirklich löschen?
        </v-card-title>

        <v-card-text>
          Belehrung
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="deletedialog = false"
          >
            Nein
          </v-btn>

          <v-btn
            color="green darken-1"
            text
            @click="deleteUser"
          >
            Ja, bitte löschen!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    </v-card>




</template>


<script>
    import {mapGetters} from "vuex";
    import DateTime from "luxon/src/datetime";
    import RoleSelector2 from "@/components/Account/RoleSelector2";
    import ConsentItemGroup from "@/components/ConsentForm/ConsentItemGroup";
    import ProofCollection from "@/components/Account/ProofCollection";
    import DepChildrenCollection from "@/components/Account/DepChildrenCollection";
    import CaregiverItem from "@/components/Account/CaregiverItem";
    import NewPasswordDialog from "@/components/Account/NewPasswordDialog";
    import ChangeEmailField from "@/components/Account/ChangeEmailField";
    import UserProfileDocument from "@/components/Documents/UserProfileDocument";


    export default {
        components: {
            UserProfileDocument,
            ChangeEmailField,
            ProofCollection, RoleSelector2,DepChildrenCollection, ConsentItemGroup, CaregiverItem, NewPasswordDialog},
        props: {
        },
          name: "account",
        data: () => (
            {
                vanishdate:null,
                initialvanishdate:null,
                deletedialog:false,
                passworddialog: false,
                choicedict: {
                      'w':'weiblich',
                      'm':'männlich'
                },
                datacollection: [
                    {
                        title: "Persönliches",
                        action: 'mdi-account',
                        itemlist: [
                            {
                                key: 'first_name',
                                readable: 'Vorname',
                                type: 'text',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'last_name',
                                readable: 'Nachname',
                                type: 'text',
                                mutable: true,
                                mutate:false,
                            },
                            {
                                key: 'date_of_birth',
                                readable: 'Geburtstag',
                                type: 'date',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'sex',
                                readable: 'Geschlecht',
                                type: 'choice',
                                mutable: false,
                                mutate:false,
                            }
                        ]
                    },
                    {
                        title: "Kontakt",
                        action: 'mdi-card-account-mail',
                        itemlist: [
                            {
                                key: 'email',
                                readable: 'Email',
                                type: 'email',
                                mutable: true,
                                mutate:false,
                            },
                            {
                                key: 'postal_address',
                                readable: 'Adresse',
                                type: 'multilinetext',
                                mutable: true,
                                mutate:false,
                            },
                            {
                                key: 'expires',
                                readable: 'Gültigkeit des Accounts',
                                type: 'datetime',
                                mutable: true,
                                mutate:false,
                            }
                        ]
                    },
                    {
                        title: "Zusammenarbeit",
                        action: 'mdi-account-child',
                        itemlist: [
                            {
                                key: 'roles',
                                readable: 'Funktion',
                                type: 'roleselector',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'dependent_children',
                                readable: '',
                                type: 'children',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'proofs',
                                readable: 'Hinterlegte Dokumente',
                                type: 'proofs',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'proofstatus',
                                readable: 'Validierungsstatus',
                                type: 'text',
                                mutable: false,
                                mutate:false,
                            },
                            {
                                key: 'consents',
                                readable: 'Einwilligungserklärungen',
                                type: 'consent',
                                mutable: false,
                                mutate:false,
                            }
                        ]
                    },
                    {
                        title: 'Profil',
                        action: 'mdi-badge-account',
                        itemlist:[
                            {key: 'document',
                            readable: 'Benutzerprofil',
                            type:'mddoc',
                            mutable: false,
                            mutate:false}
                        ]
                    }
                ],
            apiaccountdetails: {},
                orig_apiaccountdetails: {},
            consentdetails: [],
                showupdatebutton: false,
                necessaryproofs:[],
                childrendetails:[],

    }),
  computed: {

    ...mapGetters("auth", ["isAuthenticated", 'getterFirstname','getterUserObject']),
      caregiverrole () {
          return (this.apiaccountdetails['roles']) ? (this.apiaccountdetails['roles']).includes('Caregiver') ? true:false: false
      },
        childrole () {
                  return (this.apiaccountdetails['roles']) ? (this.apiaccountdetails['roles']).includes('Child') ? true:false: false
        },
        docurl() {
           return (this.$store.state.endpoints.baseUrl.slice(0,-1)+this.apiaccountdetails['document'])
        },
          },

        methods: {
             convertdt: (dt, format) => {
                    const dtc=DateTime.fromISO(dt)
                    let fd=null;
                    if (format === 'datetime') {
                        fd= dtc.toLocaleString(DateTime.DATETIME_MED)
                    }
                    if (format === 'date') {
                        fd= dtc.toLocaleString(DateTime.DATE_MED)
                    }
                    if (format === 'month') {
                        fd=dtc.toFormat('yyyy-LL');
                    }
                    return fd;
            },
            setNewExpDate: (varmutate, origValue, newValue) => {
                 const origExpdt=DateTime.fromISO(origValue)
                 const vandt = DateTime.fromISO(newValue)
                const newExpdt=origExpdt.set({year: vandt.year, month: vandt.month})
                return [!varmutate,newExpdt]
            },
            onUpdateRole (payload)  {
                 this.datacollection[2].itemlist[0].mutate=true;
                 this.apiaccountdetails['roles']=payload.value;
                 this.showupdatebutton=true
                 this.necessaryproofs=payload.proof
            },
            updateUser: function() {
                 const b = this.apiaccountdetails
                const a = this.orig_apiaccountdetails
                // compare objects and retrieve diff
                const c = Object.entries(b).reduce((c, [k, v]) => Object.assign(c, (a[k]==b[k]) ? {} : { [k]: v }), {});
                this.$store.dispatch('auth/updateAccountDetails',c)
                .then(()=> {
                    this.showupdatebutton=false
                })
            },
            deleteUser: function () {
                this.$store.dispatch('auth/deleteUser').then(()=>{
                    this.$store.dispatch('auth/logout')
                }).catch((e)=> {
                    console.log('Löschen hat nicht funktioniert: ',e)
                    this.deletedialog=false
                })
            }
        },
        mounted () {
            var this1=this;
            this.$store.dispatch('auth/getAccountDetails')
            .then((response)=> {
                this1.apiaccountdetails=Object.assign({}, response);
                 this1.orig_apiaccountdetails=Object.assign({}, response); // Backup copy for comparing
                      this1.$nextTick(function () {
                            this1.vanishdate=this1.convertdt(this1.apiaccountdetails['expires'],'month')
                            this1.initialvanishdate=this1.vanishdate;
                    })
            }).catch((e)=>{
                console.log(e)
            }).then(()=> {
                if (this1.apiaccountdetails['dependent_children'].length >0 ){
                    this1.$store.dispatch(('auth/getDependentChildren'))
                    .then((response)=> {
                        this1.childrendetails=response;
                    }).catch((e)=> {
                        console.log(e)
                    })
                }
            })
                .then(()=> {
                this1.$store.dispatch('auth/getConsentDetails')
                    .then((response2)=> {
                         this1.consentdetails=response2;
                    }).catch((e)=>{
                        console.log(e)
                    })
            })

        }

    };
</script>
