<template>
    <div>
        <v-list-item dense>
            <v-list-item-action class="ml-6">
                <v-icon v-if="!getterInformationSwitch" @click="toggleInformationSwitch">
                  mdi-information-outline
                </v-icon>
                <v-icon v-if="getterInformationSwitch" @click="toggleInformationSwitch">
                  mdi-information
                </v-icon>
                <v-list-item-action-text>Hilfe</v-list-item-action-text>
            </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="!($auth.isAuthenticated || isAuthenticated)" @click="login">
            <v-list-item-action class="ml-2">
                <v-icon large>
                    mdi-login
                </v-icon>
                <v-list-item-action-text> Anmelden</v-list-item-action-text>
            </v-list-item-action>
        </v-list-item>

        <v-list-item two-line v-if="$auth.isAuthenticated || isAuthenticated">
            <v-list-item-content class="ml-2">
                <v-list-item-title>{{ getterFullname }}</v-list-item-title>
                <v-list-item-subtitle>{{ getterUserEMail }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action class="ml-2" @click="logout">
                <v-icon large>
                    mdi-logout
                </v-icon>
                <v-list-item-action-text>Abmelden</v-list-item-action-text>
            </v-list-item-action>
        </v-list-item>

        <v-list-item v-if="$auth.isAuthenticated || isAuthenticated">
            <v-icon large
                    v-if="isNonValidatedUser"
                    >
                mdi-account-question
            </v-icon>
            <v-icon large
                    v-if="isStaff">
                mdi-account-supervisor
            </v-icon>
            <v-icon large
                    v-if="isMed">
                mdi-account-tie
            </v-icon>
            <v-icon large
                    v-if="isChild">
                mdi-account-child
            </v-icon>
            <v-icon large
                    v-if="isCaregiver">
                mdi-account-heart
            </v-icon>

            <v-list-item-content>
                <v-list-item-subtitle>{{ getterUserRole }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense>
            <v-list-item v-for="item in items" :key="item.title" link :to="item.url">
                <div
                        v-if="item.badge">
                    <v-list-item-icon>
                        <v-badge
                                :value="item.badge"
                                :content="item.badge"
                                color="green"
                                bordered
                                overlap
                        >
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-badge>
                    </v-list-item-icon>
                </div>
                <div v-else>
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>
                </div>
                <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list-item v-if="!($auth.isAuthenticated || isAuthenticated)">
            <v-list-item-action>
                <v-checkbox v-model="altloginmode"></v-checkbox>
            </v-list-item-action>

            <v-list-item-content id="menu_alt_login">
                <v-list-item-title>Alternatives Login</v-list-item-title>
                <v-list-item-subtitle>Bypass Auth0</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>

        <v-tour name="MenuTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from "vuex";
    import {run_init_after_auth} from "@/initblock2";

    export default {
        name: "Menu",
        data() {
            return {
                altloginmode: false,
                items_NonAuthenticatedUser: [
                    {title: "Impressum", icon: "mdi-information-variant", url: "/impressum", description:"Hier erfährst du mehr über uns"},
                    {title: "Datenschutz", icon: "mdi-security", url: "/p0consent", description:"Grundsätzliches zu unseren Nutzungsbedingungen und zum Datenschutz"},
                ],
                items_NonValidatedUser: [
                    {title: "Home", icon: "mdi-home", url: "/", badge: null},
                    {title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account", badge: null, description:"Die Einstellungen deines Benutzerkontos"},
                    {title: "Bildbearbeitung", icon: "mdi-image-edit-outline", url: "/ssmcenter", badge: null, description:"Hier kannst du Bilder aufnehmen, hochladen und bearbeiten. Ein guter Punkt um mit dem Programm zu starten!"},
                    {title: "Skolioseverlauf", icon: "mdi-ruler-square-compass", url: "/metrixcenter",description:"Hast du bereits Bilder zu mehreren Zeitpunkten aufgenommen? Dann kannst du hier den Verlauf deiner Messwerte anschauen."},
                    {title: "Impressum", icon: "mdi-information-variant", url: "/impressum", badge: null, description:"Hier erfährst du mehr über uns"},
                ],
                items_ValidatedUser: [
                    {title: "Home", icon: "mdi-home", url: "/authorized_start", badge: null},
                    {title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account", badge: null, description:"Die Einstellungen deines Benutzerkontos"},
                    {title: "Diskussionsraum", icon: "mdi-forum", url: "/caseroomforum", badge: this.hasNews, description:"In den Diskussionsräumen können Patient, Eltern und Behandler in Kontakt treten. Als Behandler musst du zusammen mit deinem Patient in einem Diskussionsraum sein, damit du seine Bilder und Messwerte sehen kannst."},
                    {title: "Bildbearbeitung", icon: "mdi-image-edit-outline", url: "/ssmcenter", badge: null, description:"Hier kannst du Bilder aufnehmen, hochladen und bearbeiten. Ein guter Punkt um mit dem Programm zu starten!"},
                    {title: "Skolioseverlauf", icon: "mdi-ruler-square-compass", url: "/metrixcenter",description:"Hast du bereits Bilder zu mehreren Zeitpunkten aufgenommen? Dann kannst du hier den Verlauf deiner Messwerte anschauen."},
                    {title: "Impressum", icon: "mdi-information-variant", url: "/impressum", badge: null, description:"Hier erfährst du mehr über uns"},
                ],
                items_Staff: [
                    {title: "Home", icon: "mdi-home", url: "/", badge: null},
                    {title: "Benutzerinformationen", icon: "mdi-account-details-outline", url: "/account", badge: null},
                    {title: "Bildbearbeitung", icon: "mdi-image-edit-outline", url: "/ssmcenter", badge: null, description:"Hier kannst du Bilder aufnehmen, hochladen und bearbeiten. Ein guter Punkt um mit dem Programm zu starten!"},
                    {title: "XR Board", icon: "mdi-file-document", url: "/xrboard", badge: null},
                    {title: "Document Dashboard", icon: "mdi-file-document-outline", url: "/consentdocs", badge: null, description: "Der Platz, um neue Datenschutzdokumente hochzuladen."},
                    {title: "User Dashboard", icon: "mdi-account-supervisor", url: "/dashboard", badge: null, description: "Die Übersicht über die Nutzer"},
                    {title: "Helpdesk Forum", icon: "mdi-help-network", url: "/helpdeskforum", badge: null, description: "Die Hilfezentrale"},
                    {title: "ML Model Manager", icon: "mdi-brain", url: "/mlmanager", badge: null, description: "Hier können ML Models hochgeladen und getestet werden."},
                    {title: "Impressum", icon: "mdi-information-variant", url: "/impressum", badge: null, description:"Hier erfährst du mehr über uns"},
                ],
                     tourOptions: {
                useKeyboardNavigation: false,
                labels: {
                    buttonSkip: 'Überspringen',
                    buttonPrevious: 'Vorherige',
                    buttonNext: 'Nächste',
                    buttonStop: 'OK'
                  },
            },

            };
        },
        computed: {
            ...mapGetters("auth", ['getterFullname', 'getterUserEMail', 'getterUserRole', 'isAuthenticated', "isValidatedUser", 'isNonValidatedUser', 'isStaff', 'isMed', 'isCaregiver', 'isChild', 'getterUsernameSimple']),
            ...mapGetters("imagecenter", ['getterAllEntriesAsArray', 'getterAllEntriesWOResult']),
            ...mapGetters(['isThisDeviceFastLogin','getterInformationSwitch']),
            tourSteps() {
               var a=[]
                this.items.forEach((x)=>{
                    if (Object.hasOwnProperty.call(x,'description')) {
                        a.push({target: '[href="'+x.url+'"]', content: x.description})
                    }
                })
                var b=[{
                   target: '#menu_alt_login',
                    content: 'Wenn du Alternatives Login aktivierst, wird deine Anmeldung nicht über die Server von Auth0 geleitet. Das ist kein Problem, allerdings kann diese Art der Anmeldung auf Smartphones etwas mühsamer sein.'
                }]
                return a.concat(b)
            },
            hasNews() {
                let username = this.getterUsernameSimple
                let cr = this.$store.state.caseroom.UserCaseRooms
                if (cr) {
                    let news = Object.values(cr).map((x) => x.news_for_participants.includes(username))
                    return news.reduce((n, x) => n + (x === true), 0)
                }
                return false
            },

            countSSMs() {
                let sc = this.getterAllEntriesWOResult
                if (sc) {
                    return sc.length
                } else return false
            },

            items: function () {
                let a = []
                if (!(this.isAuthenticated)) {
                    let at = a.map(x => x.title)
                    a.push(...this.items_NonAuthenticatedUser.filter((item) => at.indexOf(item.title) < 0))
                }

                if (this.isNonValidatedUser) {
                    let at = a.map(x => x.title)
                    a.push(...this.items_NonValidatedUser.filter((item) => at.indexOf(item.title) < 0))
                }

                if (this.isValidatedUser) {
                    let at = a.map(x => x.title)
                    a.push(...this.items_ValidatedUser.filter((item) => at.indexOf(item.title) < 0))
                }
                if (this.isStaff) {
                    let at = a.map(x => x.title)
                    a.push(...this.items_Staff.filter((item) => at.indexOf(item.title) < 0))
                }
                a.forEach((x) => {
                    if (x.title === "Bildbearbeitung") x.badge = this.countSSMs
                    if (x.title === "Diskussionsraum") x.badge = this.hasNews
                })
                return a
            }
        },
           watch: {
      getterInformationSwitch: {
          handler(newVal,oldVal) {
              if (newVal && !oldVal) {
                    this.$tours["MenuTour"].start();
                  } else this.$tours["MenuTour"].stop();
              }
          },
    },
        methods: {
             ...mapMutations(['toggleInformationSwitch']),
            login() {
                if (this.altloginmode) {
                    if (this.isThisDeviceFastLogin) run_init_after_auth(this)
                    else this.$router.push('/login')
                } else this.$auth.loginWithRedirect()
            },
            logout() {
                var returnto = process.env.VUE_APP_FRONTEND_URL

                this.$store.dispatch('auth/logout')
                    .then(() => {
                      //  let fastlogindevice = this.$store.getters['isThisDeviceFastLogin']
                        this.$disconnect()

                        this.loggedin = false
                    }).finally(() => {

                        if (!this.altloginmode) {
                        this.$auth.logout({
                            returnTo: returnto
                        })
                    }
                })

            },
        }
    };
</script>
