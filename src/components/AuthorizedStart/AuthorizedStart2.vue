<template>
    <v-card class="pa-2">
        <v-container>
            <ConsentForm
                    v-if="showconsentform"
                    consent_type="P0"
                    @consentdecision="onConsentDecision"
            >
            </ConsentForm>

            <v-container v-if="stillToDo">
                <v-sheet
                        elevation="8"
                >
                    <v-stepper v-model="todo_stepper" :vertical="$vuetify.breakpoint.smAndDown">

                        <template v-for="n in steps">
                            <v-stepper-step
                                    :key="`${n}-step`"
                                    :complete="todo_stepper > n"
                                    :step="n"
                            >{{ refined_items_headers[n-1] }}
                            </v-stepper-step>


                            <v-stepper-content
                                    :key="`${n}-content`"
                                    :step="n"
                            >
                                <v-card
                                        class="mb-12"
                                        color="grey lighten-1"
                                >

                                    <v-card-title>
                                        {{ refined_items[n-1] ? refined_items[n-1].title : '' }}
                                    </v-card-title>
                                    <v-card-subtitle>{{ refined_items[n-1] ? refined_items[n-1].subtitle : '' }}
                                    </v-card-subtitle>
                                    <v-component v-if="refined_items[n-1]"
                                                 v-bind="refined_items[n-1].params"
                                                 v-on="refined_items[n-1].events"
                                                 :is="refined_items[n-1].component" class="pa-2"></v-component>
                                </v-card>

                                <v-btn
                                        v-if="(refined_items[n-1].hasOwnProperty('component') ? refined_items[n-1].component.hasOwnProperty('name') ? refined_items[n-1].component.name!=='NewPasswordDialog':true : true)"
                                        color="primary"
                                        @click="nextStep(n)"
                                >
                                    Weiter
                                </v-btn>

                                <v-btn text color="orange"
                                       @click="stillToDo=false">
                                    Ich mach's später
                                </v-btn>
                            </v-stepper-content>
                        </template>
                    </v-stepper>

                </v-sheet>

            </v-container>


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
                    Wie geht's weiter ?
                </v-card-title>
                <v-card-subtitle>
                    Du kannst jetzt Fotos und Röntgenbilder über das (+) rechts unten in das System hochladen. Deine
                    Diskussionsräume werden wir dir demnächst aufschließen.
                </v-card-subtitle>
            </v-card>

            <v-card v-if="!stillToDo&isValidatedUser">
                <v-card-title>
                    Benutzerbereich
                </v-card-title>
                <v-card-subtitle>
                    Alle Anforderungen erfüllt. Dein Benutzerkonto wurde validiert, du kannst jetzt alle Möglichkeiten
                    nutzen.
                </v-card-subtitle>
            </v-card>
            <v-container v-if="(Boolean(getUserCaseRooms))&(!isStaff)">
                <CrItem v-if="getHelpDeskCaseRoom"
                        :contents="getHelpDeskCaseRoom.caseroom"
                        :cr_id="getHelpDeskCaseRoom.id"
                        omit_btns
                />
            </v-container>
            <v-card v-if="!stillToDo&isValidatedUser&isCaregiver">
                <v-card-title>Eigene Kinder</v-card-title>

                <DepChildrenCollection
                        v-if="getterUserObject"
                        load-children
                        @childAdded="getChildrenDetails(getterUserObject)"
                >
                </DepChildrenCollection>
            </v-card>


            <Ssmsequencecreator v-if="start_ssmsequence"
                                @SSMSequenceDialogClosed="start_ssmsequence=false"></Ssmsequencecreator>
            <SSMCreateDialog v-if="start_ssmcreate" @SSMCreateDialogClosed="start_ssmcreate=false"></SSMCreateDialog>
            <CaseRoomCreateDialog v-if="start_caseroomcreate"
                                  @CaseRoomCreateDialogClosed="start_caseroomcreate=false"></CaseRoomCreateDialog>


            <Veasycampanel v-if="start_ssmcamera" @CamPanelClosed="start_ssmcamera=false"></Veasycampanel>


        </v-container>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-speed-dial
                    v-model="fab"
                    absolute
                    bottom
                    right
                    direction="top"
                    transition="slide-y-reverse-transition"
                    id="tracer_ssm_sequence_speed_dial"
            >
                <template v-slot:activator>
                    <v-btn
                            v-model="fab"
                            color="blue darken-2"
                            dark
                            fab
                    >
                        <v-icon v-if="fab">
                            mdi-close
                        </v-icon>
                        <v-icon v-else>
                            mdi-plus
                        </v-icon>
                    </v-btn>
                </template>

                <v-tooltip
                        v-model="tooltip_caseroomcreate"
                        left
                        v-if="isCaregiver"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-if="isCaregiver"
                               v-bind="attrs"
                               v-on="on"
                               fab
                               small
                               dark
                               color="green"
                               @click.stop="start_caseroomcreate=true"
                        >
                            <v-icon>mdi-chat-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Neuen Diskussionsraum erstellen</span>
                </v-tooltip>

                <v-tooltip
                        v-model="tooltip_accountplus"
                        left
                        v-if="(isCaregiver || isMed) && !(isChild || isAdult || isPatient)"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-if="(isCaregiver || isMed) && !(isChild || isAdult || isPatient)"
                               v-bind="attrs"
                               v-on="on"
                               fab
                               small
                               dark
                               color="indigo"
                               @click.stop="start_ssmsequence=true"
                        >
                            <v-icon>mdi-account-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Neuen Benutzer anlegen</span>
                </v-tooltip>
                <v-tooltip v-if="isChild || isAdult || isPatient"
                           v-model="tooltip_uploadfiles"
                           left
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-if="isChild || isAdult || isPatient"
                               v-bind="attrs"
                               v-on="on"
                               fab
                               small
                               dark
                               color="indigo"
                               @click.stop="start_ssmcreate=true"
                        >
                            <v-icon>mdi-cloud-upload</v-icon>
                        </v-btn>
                    </template>
                    <span>Gespeicherte Bilder hochladen</span>
                </v-tooltip>

                <v-tooltip
                        v-if="isChild || isAdult || isPatient"
                        v-model="tooltip_camera"
                        left
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-if="isChild || isAdult || isPatient"
                               v-bind="attrs"
                               v-on="on"
                               fab
                               small
                               dark
                               color="indigo"
                               @click.stop="start_ssmcamera=true"
                        >
                            <v-icon>mdi-camera</v-icon>
                        </v-btn>
                    </template>
                    <span>Fotos machen und hochladen</span>
                </v-tooltip>
            </v-speed-dial>
        </v-card-actions>


        <v-snackbar
                v-model="snackbar"
                timeout="2000"
        >
            {{ snackbar_text }}
        </v-snackbar>
        <v-tour name="authorized_startTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </v-card>

</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import Vue from 'vue';

    import NewPasswordDialog from "@/components/Account/NewPasswordDialog";
    import RoleSelector2 from "@/components/Account/RoleSelector2";
    import BirthdayPicker from "@/components/Account/BirthdayPicker";
    import ProofCollection from "@/components/Account/ProofCollection";
    import MissingConsentGroup from "@/components/ConsentForm/MissingConsentGroup";
    import axios from "axios";
    import IntroTour from "@/components/IntroTour/IntroTour";
    import ChangeEmailField from "@/components/Account/ChangeEmailField";
    import ConsentForm from "@/components/ConsentForm/ConsentForm";
    import DepChildrenCollection from "@/components/Account/DepChildrenCollection";
    import CrItem from "@/components/CaseRoom/CaseRoomItem";
    import Ssmsequencecreator from "@/components/SSMCenter/SSMSequenceCreator";
    import CaseRoomCreateDialog from "@/components/CaseRoom/CaseRoomCreateDialog";
    import SSMCreateDialog from "@/components/SSMCenter/SSMCreateDialog";
    import {run_init_after_auth} from "@/initblock2";
    import component_tracer from "@/mixins/component_tracer";
    import NameInputField from "@/components/Account/NameInputField";
    import Veasycampanel from "@/components/VCamera/VEasyCamPanel";

    export default {

        components: {
            SSMCreateDialog,
            CaseRoomCreateDialog,
            ConsentForm,
            DepChildrenCollection,
            BirthdayPicker,
            ChangeEmailField,
            IntroTour,
            MissingConsentGroup,
            NewPasswordDialog,
            ProofCollection,
            RoleSelector2,
            CrItem,
            Ssmsequencecreator,
            Veasycampanel
        },
        name: 'authorized_start',
        mixins: [component_tracer],
        data: () => ({
            fab: false,
            start_ssmsequence: false,
            start_ssmcreate: false,
            start_ssmcamera: false,
            start_caseroomcreate: false,
            stilltodo_switch: null,
            todo_slider: null,
            todo_stepper: null,
            model: null,
            snackbar: false,
            snackbar_text: '',
            necc_proofs: [],
            has_defaultpassword: false,
            has_expired: false,
            consentGiven: false,
            changed_values: {},
            childrendetails: [],
            proofsuploaded: false,

            tooltip_caseroomcreate: false,
            tooltip_uploadfiles: false,
            tooltip_camera: false,
            tooltip_accountplus: false,
        }),
        mounted() {
            if (this.isAuthenticated) {
                this.checkDef();
                this.$store.dispatch('auth/getUserProofs')
            } else {
                run_init_after_auth(this)
            }
        },

        computed: {
            ...mapGetters("auth", ["isAuthenticated", "getterUserObject", "isStaff", "isValidatedUser", "isNonValidatedUser", "isCaregiver", "isChild", "isAdult", "isPatient", "isMed", "getterOverallMissingProofs"]),
            ...mapGetters('caseroom', ['getHelpDeskCaseRoom', 'getUserCaseRooms']),

            nomissingproofs: function () {
                let mp = this.$store.getters['auth/getterMissingProofs']
                if (mp) {
                    if (mp.length == 0) return true
                    else return false
                } else
                    return true
            },
            stillToDo: {
                set: function (val) {
                    this.stilltodo_switch = val
                },
                get: function () {
                    if (this.stilltodo_switch !== null) {
                        return this.stilltodo_switch
                    } else {
                        const reducer = (accumulator, currentValue) => accumulator || currentValue;
                        return (this.items.length > 0) ? this.items.map(x => x.condition).reduce(reducer) : []
                    }
                },
            },

            showconsentform: function () {
                return (this.$store.getters['auth/getterUserObject'] ? (this.$store.getters['auth/getterUserObject'].missing.includes('hasP0consent')) & (!this.consentGiven) : null)
            },
            items: function () {
                var user = this.getterUserObject

                if (user) {
                    var hasdefaultemail = user.email.includes('@skoliosekinder.de')

                    return [
                        {
                            title: 'Name',
                            condition: ((user.first_name === '') || (user.first_name === null) || (user.last_name === '') || (user.last_name === null)),
                            subtitle: 'Bitte nenn uns deinen Vor- und Nachnamen',
                            component: NameInputField,
                            events: {
                                "newName": () => this.message('Name wurde eingetragen.'),
                                "error": () => this.message('Ein Fehler ist passiert - der Name wurde nicht verändert')
                            }
                        },
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
                                label: 'Passwort',
                                user: user,
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
                                user: user,
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
                            params: {
                                "birthday_date": user.date_of_birth
                            },
                            events: {
                                "updateBirthday": (x) => Vue.set(this.changed_values, 'date_of_birth', x.date),
                            },

                        },
                        {
                            title: 'Deine Funktion',
                            condition: !((user.proofstatus == 'APPROVED') || (user.proofstatus == 'VALIDATED') || user.roles.includes('Child')),//(user.roles.length === 0),
                            subtitle: 'Was ist Deine Funktion bei Skoliosekinder?',
                            component: RoleSelector2,
                            params: {
                                "value": user.roles,
                                "birthday_date": user.date_of_birth
                            },
                            events: {
                                "updateRole": (x) => {
                                    Vue.set(this.changed_values, 'roles', x.value);
                                    this.updateUser()
                                }
                            },

                        },
                        {
                            title: 'Bescheinigungen',
                            condition: !((user.proofstatus == 'APPROVED') || (user.proofstatus == 'VALIDATED') || this.proofsuploaded || user.roles.includes('Child')),
                            subtitle: 'Haben wir alle Nachweise?',
                            component: ProofCollection,
                            events: {
                                "proofsuploaded": () => {
                                    this.proofsuploaded = true
                                }
                            },
                        },
                        {
                            title: 'Erklärungen',
                            condition: user.missing ? user.missing.includes('consentscomplete') : false,
                            subtitle: 'Könntest Du Dich bitte noch mit folgenden Details befassen und Dein Einverständnis geben:',
                            component: MissingConsentGroup,
                            params: {
                                user: user,
                            },
                            events: {
                                "alldone": () => {
                                    user.missing = user.missing.filter(item => item !== 'consentscomplete')
                                }
                            }
                        },
                        {
                            title: 'Erklärungen der Kinder',
                            condition: user.missing ? user.missing.includes('childrenconsentscomplete') : false,
                            subtitle: 'Eines oder alle deine Kinder haben noch nicht alle Einverständniserklärungen akzeptiert oder sind vom System noch nicht validiert worden. Für das Einverständnis müssen sich Deine Kinder anmelden.',
                        },
                        {
                            title: 'Elternteil',
                            condition: user.missing ? user.missing.includes('caregivercomplete') : false,
                            subtitle: 'Du solltest bei Skoliosekinder von einem Elternteil vertreten werden. Einer deiner Eltern sollte sich ebenfalls anmelden und dich als Kind eintragen.',
                        },
                        {
                            title: 'Einführung',
                            condition: user.missing ? user.missing.includes('instruction_level') : false,
                            subtitle: 'Bitte schau Dir noch die kurze Einführung an.',
                            component: IntroTour,
                            events: {
                                "IntroFinished": () => Vue.set(this.changed_values, 'instruction_level', 'BASIC')
                            }
                        },
                    ]
                } else {
                    return []
                }
            },

            refined_items: function () {
                return this.items.filter(x => x.condition)
            },
            refined_items_headers: function () {
                return this.items.filter(x => x.condition).map((x) => x.title)
            },
            steps: function () {
                return this.refined_items.length
            },
        },

        methods: {
            ...mapActions('auth', ['reFetchUser']),
            getChildrenDetails: function (user) {
                let children = []
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
            checkDef: function () {
                var config2 = {
                    method: 'GET',
                    url: this.$store.state.endpoints.baseUrl + 'check_defaultpassword/',
                    headers: {
                        authorization: `Bearer ${this.$store.state.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                };
                axios(config2).then((response2) => {
                    this.has_defaultpassword = response2.data.defaultpassword
                    this.has_expired = response2.data.expired
                })
            },
            onConsentDecision: function (payload) {
                if (payload) {
                    this.consentGiven = true
                } else {
                    this.$store.dispatch('auth/logout')
                }
            },
            updateUser: function () {
                if (Object.keys(this.changed_values).length !== 0) {
                    var values_to_change = Object.assign({}, this.changed_values)
                    this.changed_values = {}
                    this.$store.dispatch('auth/updateAccountDetails', values_to_change)
                        .then(() => {
                            this.$store.dispatch('auth/getUserProofs')
                        }).catch(() => {
                        this.changed_values = values_to_change
                    })
                }
            },
            message: function (text) {
                this.snackbar_text = text
                this.snackbar = true
            },
            nextStep(n) {
                if (n === this.steps) {
                    this.todo_stepper = 1
                } else this.todo_stepper = n + 1
            },
        },
        watch: {
            changed_values: {
                handler(newVal, oldVal) {
                    if (oldVal == newVal) {
                        //console.log(newVal)
                        this.updateUser()
                    }
                },
                deep: true
            },

            items: {
                handler(newVal, oldVal) {
                    if (oldVal == newVal) {
                        //console.log(newVal)
                        this.updateUser()
                    }
                },
                deep: true
            },
            steps(val) {
                if (this.todo_stepper > val) {
                    this.todo_stepper = val
                }
            },
            stillToDo(newVal, oldVal) {
                if ((oldVal) && (!newVal))
                    if (this.isNonValidatedUser) {
                        this.reFetchUser()
                    }
            }
        },

        props: {
            user: Object
        },

    };
</script>
