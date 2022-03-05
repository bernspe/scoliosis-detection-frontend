<template>
    <v-app>
        <loader v-if="AppLoading" object="#ff9633" color1="#ffffff" color2="#17fd3d" size="5" speed="2" bg="#343a40"
                objectbg="#999793" opacity="80" name="circular"></loader>
        <v-navigation-drawer
                class="pt-2"
                v-model="isOpenDrawer"
                clipped
                app
                disable-resize-watcher
        >
            <Menu></Menu>
        </v-navigation-drawer>
        <v-app-bar app color="primary" clipped-left dark>
            <v-app-bar-nav-icon
                    @click="isOpenDrawer = !isOpenDrawer"
                    id="tracer_navbar"
            ></v-app-bar-nav-icon>
            <div>
            <v-banner single-line elevation="5" color="red" v-if="testmode && $vuetify.breakpoint.smAndUp">Testmodus
            </v-banner>
            <v-icon color="red" v-if="testmode && $vuetify.breakpoint.xs">mdi-test-tube</v-icon>
            </div>
                <v-spacer v-if="testmode"></v-spacer>
            <router-link to="/">
                <div class="d-flex align-center">
                    <v-img
                            alt="Skoliosekinder Logo"
                            class="shrink mr-2"
                            contain
                            src="./assets/logo2-gelb.png"
                            transition="scale-transition"
                            width="40"
                    />

                    <v-img
                            v-if="$vuetify.breakpoint.mdAndUp"
                            alt="skoliosekinder name"
                            contain
                            src="./assets/schriftzug1-3.png"
                            height="48"
                    />
                </div>
            </router-link>

            <v-spacer></v-spacer>


            <v-avatar v-if="$auth.isAuthenticated" size="40">
                <img :src="$auth.user.picture" :alt="$auth.user.name">
            </v-avatar>

            <v-spacer></v-spacer>

            <v-icon class="ml-2 mr-2" v-if="getterInformationSwitch" @click="toggleInformationSwitch">
                mdi-information
            </v-icon>
            <v-icon class="ml-2 mr-2" v-if="!getterInformationSwitch" @click="toggleInformationSwitch">
                mdi-information-outline
            </v-icon>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
            <v-bottom-sheet v-model="snackbar">
                <v-sheet
                        class="text-center"
                        height="200px"
                >
                    <div class="py-3">
                        <v-list>
                            <v-list-item v-for="(msg,index) in getterMessages" :key="index">
                                <Caseroomentry :id="msg.id"></Caseroomentry>
                            </v-list-item>
                        </v-list>

                    </div>
                </v-sheet>
            </v-bottom-sheet>

            <v-tour name="AppTour" :steps="tourSteps" :options="tourOptions"></v-tour>

            <v-snackbar
                    absolute
                    centered
                    v-model="snackbar2"
                    :color="getSnackBarColorFromType(getterSnackBarMessage ? getterSnackBarMessage.type : null)"
            >
                {{ getterSnackBarMessage ? getterSnackBarMessage.text : null }}

                <template v-slot:action="{ attrs }">
                    <v-btn
                            color="pink"
                            text
                            v-bind="attrs"
                            @click="resetSnackBar"
                    >
                        Close
                    </v-btn>
                </template>
            </v-snackbar>

        </v-main>
    </v-app>
</template>

<script>
    import Vuetify from "vuetify";
    import {mapActions, mapGetters, mapMutations} from "vuex";
    import Menu from "@/components/Menu";
    import * as FingerprintJS from "@fingerprintjs/fingerprintjs";
    import pLimit from 'p-limit';
    import {run_init_after_auth} from "@/initblock2";
    import Caseroomentry from "@/components/CaseRoom/CaseRoomEntry";
    import component_tracer from "@/mixins/component_tracer";


    const limit = pLimit(1);

    export default {
        name: 'App',
        mixins: [component_tracer],
        vuetify: new Vuetify(),
        components: {Caseroomentry, Menu},
        data: () => ({
            isOpenDrawer: false,
            loggedin: false,
            snbar: false,
            snbar2: false,
            AppLoading: true,
        }),


        computed: {
            ...mapGetters("auth", ["isAuthenticated", 'getterFirstname', 'getterUsername', 'isValidatedUser', 'isNonValidatedUser', 'isStaff', 'getterUsernameSimple', 'isMed', 'isChild', 'isCaregiver']),
            ...mapGetters(['getterBackendVersion', 'getterFrontendVersion', 'getterInformationSwitch']),
            ...mapGetters('messagehub', ['getterMessages', 'getterSnackBarMessage']),

            testmode: function () {
                return process.env["VUE_APP_STATUS"] === 'test'
            },
            snackbar: {
                set: function (val) {
                    if (!val) {
                        this.$store.commit('messagehub/resetMessage')
                    }
                    this.snbar = val
                },
                get: function () {
                    return (this.getterMessages.length > 0) || this.snbar
                }
            },

            snackbar2: {
                set: function (val) {
                    this.snbar2 = val
                },
                get: function () {
                    return (this.getterSnackBarMessage) || this.snbar2
                }
            },


            hasNews() {
                let username = this.getterUsernameSimple
                let cr = this.$store.state.caseroom.UserCaseRooms
                if (cr) {
                    let news = Object.values(cr).map((x) => x.news_for_participants.includes(username))
                    return news.includes(true)
                }
                return false
            },

        },

        mounted() {
            this.$store.commit('messagehub/setStartupDisclosure')

            this.$store.commit('setDeviceMobile', {
                isMobile: this.getDeviceType() === 'mobile',
                device_type: this.getDeviceType(),
                device_descriptor: navigator.userAgent.substring(0, 254),
            })
            const input = [
                limit(() => this.$store.dispatch('getBackEndVersion')
                    .then(() => {
                        let bv = this.$store.getters['getterBackendVersion']
                        let saved_bv = localStorage.getItem('backend_version');
                        let fv = this.$store.getters['getterFrontendVersion']
                        let saved_fv = localStorage.getItem('frontend_version');
                        console.log('Version check. Cached: Frontend=', saved_fv, ', Backend=', saved_bv, '. Last: Frontend=', fv, ', Backend=', bv)
                        if ((bv != saved_bv) | (fv != saved_fv)) {
                            localStorage.setItem('backend_version', bv)
                            localStorage.setItem('frontend_version', fv)
                            console.log('Forcing reload')
                            window.location.reload(true)
                        }
                    })),
                limit(() => {
                    let device_id = localStorage.getItem('device_id')
                    if (!((device_id == "undefined") || (device_id == null))) {
                        this.$store.commit('setDeviceID', device_id)
                    } else {
                        const fpPromise = FingerprintJS.load()
                        fpPromise.then(fp => fp.get()).then(result => {
                            this.$store.commit('setDeviceID', result.visitorId)
                            localStorage.setItem('device_id', result.visitorId)
                        })
                    }
                }),
                /*
           limit(() => {
             run_init_after_auth(this1)
           }),*/
            ];
            (async () => {
                // Only one promise is run at once
                await Promise.all(input);
                this.AppLoading = false
            })();

        },
        watch: {
            '$auth.isAuthenticated': function (val) {
                //console.log('Auth status changed: ', val)
                if (val) {
                    this.$auth.getTokenSilently().then((token) => {
                        this.$store.dispatch('auth/loginWAuth0Token', {token: token})
                            .then(() => run_init_after_auth(this))
                    })
                }
            },
        },

        methods: {
            ...mapActions('auth', ['reFetchUser']),
            ...mapMutations(['toggleInformationSwitch']),

            getDeviceType: function () {
                const ua = navigator.userAgent;
                if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                    return "tablet";
                }
                if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                    return "mobile";
                }
                return "desktop";
            },

            getSnackBarColorFromType: function (type) {
                if (type === 'info') return "blue-grey"
                if (type === 'error') return "deep-purple accent-4"
            },

            resetSnackBar: function () {
                this.$store.commit('messagehub/resetSnackBarMessage')
                this.snackbar2 = false
            }

        },

    };
</script>


<style lang="scss">
    #app .v-step {
        background: #ffc107; /*#50596c; , #35495e */
        color: darkblue;
        max-width: 320px;
        border-radius: 20px;
        box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
        rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
    }

    #app .v-step__button {
        background: transparent;
        border: .05rem solid white;
        border-radius: 10%;
        color: darkblue;
        cursor: pointer;
        display: inline-block;
        font-size: .8rem;
        height: 1.8rem;
        line-height: 1rem;
        outline: none;
        margin: 0 0.2rem;
        padding: .35rem .4rem;
        text-align: center;
        text-decoration: none;
        transition: all .2s ease;
        vertical-align: middle;
        white-space: nowrap;

        &:hover {
            background-color: rgba(white, 0.95);
            color: #50596c;
        }
    }
</style>