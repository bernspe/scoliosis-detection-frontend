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
                            <v-list-item-title v-text="child.readable"
                                               v-if="child.type!='children'"></v-list-item-title>
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
                                        v-if="caregiverrole"
                                >Kinder
                                </v-list-item-title>
                                <v-list-item-subtitle
                                        v-if="caregiverrole"
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
                                    v-if="child.key=='avatar'">
                                <v-row dense>
                                    <v-col>
                                        <v-avatar size="72px" left><img :src="avatarurl"></v-avatar>
                                    </v-col>
                                    <v-col>
                                        <Vcameradialog program="avatar" :owner="getterUsernameSimple"
                                                       label="Neues Bild einstellen"></Vcameradialog>
                                    </v-col>
                                </v-row>
                            </v-list-item-subtitle>

                            <v-list-item-subtitle
                                    v-if="child.key=='document'">
                                <UserProfileDocument
                                        :document_url="docurl"
                                        :mutable="true"
                                >

                                </UserProfileDocument>
                            </v-list-item-subtitle>

                            <!-- Show User Devices -->
                            <v-list-item-subtitle
                                    v-if="child.key=='devices'">
                                <v-card>
                                    <v-list three-line subheader>
                                        <v-subheader>Dieses Gerät</v-subheader>
                                        <Userdevices
                                                thisdevice
                                                :device="getterDevice"
                                                @addDevice="addDevice(getterDevice)"
                                                @removeDevice="removeDevice"></Userdevices>
                                        <v-subheader v-if="getterOtherDevices.length>0">Für Fast Login registrierte
                                            Geräte
                                        </v-subheader>
                                        <v-list-item v-for="dev in getterOtherDevices" :key="dev.device_id">
                                            <Userdevices
                                                    :device="dev"
                                                    @addDevice="addDevice(dev)"
                                                    @removeDevice="removeDevice(dev)"></Userdevices>
                                        </v-list-item>
                                    </v-list>
                                </v-card>

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
                                        @click="showupdatebutton=true">mdi-check
                                </v-icon>
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
            <v-row dense>
            <v-btn v-if="apiaccountdetails.is_active"
                   color="red" text
                   @click.stop="deletedialog=true"
            >Löschen
                <v-icon
                        right
                        dark
                >
                    mdi-delete
                </v-icon>
            </v-btn>
            <v-btn v-else color="success" @click="toggleUserAct">Account aktivieren</v-btn>

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
                </v-row>
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
                    Wir markieren deinen Account als inaktiv und löschen ihn. Du kannst diese Markierung jetzt wieder
                    aufheben, indem du auf Account aktivieren clickst. Ansonsten wirst du dich nicht wieder anmelden
                    können.
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
                            @click="toggleUserAct"
                    >
                        Ja, bitte löschen!
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-tour name="authorized_startTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </v-card>


</template>


<script>
    import {mapActions, mapGetters} from "vuex";
    import DateTime from "luxon/src/datetime";
    import RoleSelector2 from "@/components/Account/RoleSelector2";
    import ConsentItemGroup from "@/components/ConsentForm/ConsentItemGroup";
    import ProofCollection from "@/components/Account/ProofCollection";
    import DepChildrenCollection from "@/components/Account/DepChildrenCollection";
    import CaregiverItem from "@/components/Account/CaregiverItem";
    import NewPasswordDialog from "@/components/Account/NewPasswordDialog";
    import ChangeEmailField from "@/components/Account/ChangeEmailField";
    import UserProfileDocument from "@/components/Documents/UserProfileDocument";
    import Userdevices from "@/components/Account/UserDevices";
    import component_tracer from "@/mixins/component_tracer";
    import Vcameradialog from "@/components/VCamera/VCameraDialog";


    export default {
        components: {
            Vcameradialog,
            Userdevices,
            UserProfileDocument,
            ChangeEmailField,
            ProofCollection, RoleSelector2, DepChildrenCollection, ConsentItemGroup, CaregiverItem, NewPasswordDialog
        },
        props: {},
        name: "account",
        mixins: [component_tracer],
        data: () => (
            {
                vanishdate: null,
                initialvanishdate: null,
                deletedialog: false,
                passworddialog: false,
                choicedict: {
                    'w': 'weiblich',
                    'm': 'männlich'
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
                                mutable: true,
                                mutate: false,
                            },
                            {
                                key: 'last_name',
                                readable: 'Nachname',
                                type: 'text',
                                mutable: true,
                                mutate: false,
                            },
                            {
                                key: 'date_of_birth',
                                readable: 'Geburtstag',
                                type: 'date',
                                mutable: false,
                                mutate: false,
                            },
                            {
                                key: 'sex',
                                readable: 'Geschlecht',
                                type: 'choice',
                                mutable: false,
                                mutate: false,
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
                                mutate: false,
                            },
                            {
                                key: 'postal_address',
                                readable: 'Adresse',
                                type: 'multilinetext',
                                mutable: true,
                                mutate: false,
                            },
                            {
                                key: 'expires',
                                readable: 'Gültigkeit des Accounts',
                                type: 'datetime',
                                mutable: true,
                                mutate: false,
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
                                mutate: false,
                            },
                            {
                                key: 'dependent_children',
                                readable: '',
                                type: 'children',
                                mutable: false,
                                mutate: false,
                            },
                            {
                                key: 'proofs',
                                readable: 'Hinterlegte Dokumente',
                                type: 'proofs',
                                mutable: false,
                                mutate: false,
                            },
                            {
                                key: 'proofstatus',
                                readable: 'Validierungsstatus',
                                type: 'text',
                                mutable: false,
                                mutate: false,
                            },
                            {
                                key: 'consents',
                                readable: 'Einwilligungserklärungen',
                                type: 'consent',
                                mutable: false,
                                mutate: false,
                            }
                        ]
                    },
                    {
                        title: 'Profil',
                        action: 'mdi-badge-account',
                        itemlist: [
                            {
                                key: 'avatar',
                                readable: 'Profilbild',
                                type: 'image',
                                mutable: true,
                                mutate: false
                            },

                            {
                                key: 'document',
                                readable: 'Benutzerprofil',
                                type: 'mddoc',
                                mutable: false,
                                mutate: false
                            }
                        ]
                    },
                    {
                        title: 'Geräte',
                        action: 'mdi-tablet-cellphone',
                        itemlist: [
                            {
                                key: 'devices',
                                readable: 'Fast Login Geräte',
                                type: 'devices',
                                mutable: false,
                                mutate: false
                            }
                        ]
                    }
                ],
                apiaccountdetails: {},
                orig_apiaccountdetails: {},
                consentdetails: [],
                showupdatebutton: false,
                necessaryproofs: [],
                childrendetails: [],

            }),
        computed: {

            ...mapGetters("auth", ["isAuthenticated", 'getterFirstname', 'getterUserObject', 'getterUsernameSimple']),
            ...mapGetters(['getterDevice', 'getterOtherDevices']),
            caregiverrole() {
                return (this.apiaccountdetails['roles']) ? (this.apiaccountdetails['roles']).includes('Caregiver') ? true : false : false
            },
            childrole() {
                return (this.apiaccountdetails['roles']) ? (this.apiaccountdetails['roles']).includes('Child') ? true : false : false
            },
            docurl() {
                return (this.$store.state.endpoints.baseUrl.slice(0, -1) + this.apiaccountdetails['document'])
            },
            avatarurl() {
                return (this.$store.state.endpoints.baseUrl.slice(0, -1) + this.apiaccountdetails['avatar']+this.timefragment())
            },
        },

        methods: {
            ...mapActions('auth', ['toggleUserActivation']),
            timefragment: function (){
                // Cachebreaker time fragment, limit reload to 60s
               return '?t=' + Math.round(new Date().getTime()/60000);
           },
            convertdt: (dt, format) => {
                const dtc = DateTime.fromISO(dt)
                let fd = null;
                if (format === 'datetime') {
                    fd = dtc.toLocaleString(DateTime.DATETIME_MED)
                }
                if (format === 'date') {
                    fd = dtc.toLocaleString(DateTime.DATE_MED)
                }
                if (format === 'month') {
                    fd = dtc.toFormat('yyyy-LL');
                }
                return fd;
            },
            setNewExpDate: (varmutate, origValue, newValue) => {
                const origExpdt = DateTime.fromISO(origValue)
                const vandt = DateTime.fromISO(newValue)
                const newExpdt = origExpdt.set({year: vandt.year, month: vandt.month})
                return [!varmutate, newExpdt]
            },
            onUpdateRole(payload) {
                this.datacollection[2].itemlist[0].mutate = true;
                this.apiaccountdetails['roles'] = payload.value;
                this.showupdatebutton = true
                this.necessaryproofs = payload.proof
            },
            updateUser: function () {
                const b = this.apiaccountdetails
                const a = this.orig_apiaccountdetails
                // compare objects and retrieve diff
                const c = Object.entries(b).reduce((c, [k, v]) => Object.assign(c, (a[k] == b[k]) ? {} : {[k]: v}), {});
                this.$store.dispatch('auth/updateAccountDetails', c)
                    .then(() => {
                        this.showupdatebutton = false
                    })
            },

            toggleUserAct() {
                this.toggleUserActivation(null).then((res) => {
                    this.$set(this.apiaccountdetails, 'is_active', res.data['user-activation'].toLowerCase() === 'true')
                }).finally(() => this.deletedialog = false)
            },

            addDevice: function (device) {
                this.$store.dispatch('auth/addDevice', device)
                    .then(() => {
                        this.$store.dispatch('auth/getDevices')
                    })
            },

            removeDevice: function (payload) {
                this.$store.dispatch('auth/removeDevice', {id: payload.id})
                    .then(() => {
                        this.$store.dispatch('auth/getDevices')
                    })
            },
        },
        mounted() {
            var this1 = this;
            //this.$set(this.apiaccountdetails,'is_active',  true)
            this.$store.dispatch('auth/getAccountDetails')
                .then((response) => {
                    this1.apiaccountdetails = Object.assign({}, response);
                    this1.orig_apiaccountdetails = Object.assign({}, response); // Backup copy for comparing
                    this1.$nextTick(function () {
                        this1.vanishdate = this1.convertdt(this1.apiaccountdetails['expires'], 'month')
                        this1.initialvanishdate = this1.vanishdate;
                    })
                }).catch((e) => {
                console.log(e)
            }).then(() => {
                if (this1.apiaccountdetails['dependent_children'].length > 0) {
                    this1.$store.dispatch(('auth/getDependentChildren'))
                        .then((response) => {
                            this1.childrendetails = response;
                        }).catch((e) => {
                        console.log(e)
                    })
                }
            })
                .then(() => {
                    this1.$store.dispatch('auth/getConsentDetails')
                        .then((response2) => {
                            this1.consentdetails = response2;
                        }).catch((e) => {
                        console.log(e)
                    })
                })
                .then(() => {
                    this1.$store.dispatch('auth/getDevices')

                })

        }

    };
</script>
