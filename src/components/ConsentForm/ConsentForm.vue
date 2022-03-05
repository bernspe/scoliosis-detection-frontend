<template>
    <v-row justify="center">
        <v-dialog
                v-model="dialog"
                :persistent="!omitButtons"
        >
            <v-card>
                <v-progress-linear
                        indeterminate
                        color="green"
                        v-if="consentloading"
                ></v-progress-linear>
                <v-card-title>Einverständniserklärung</v-card-title>
                <v-list subheader
                        v-if="involved_users">
                    <v-subheader>Betrifft folgende Personen</v-subheader>

                    <v-list-item
                            v-for="member in participantData"
                            :key="member.username"
                    >
                        <v-list-item-content
                                v-if="member">
                            <v-list-item-title v-text="member.name"></v-list-item-title>
                            <v-list-item-subtitle v-text="roles_de(member.roles)"></v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>

                <v-card-text>
                    <div>
                        <markdown-it-vue class="md-body" :content="content"/>
                    </div>
                </v-card-text>
                <v-card-actions v-if="!omitButtons">
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="decline"
                    >
                        Nicht akzeptieren
                    </v-btn>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="accept"
                    >
                        Akzeptieren
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>

    import MarkdownItVue from 'markdown-it-vue'
    import 'markdown-it-vue/dist/markdown-it-vue.css'
    import axios from "axios";
    import {mapGetters} from "vuex";

    export default {
        components: {MarkdownItVue},
        data() {
            return {
                dialog: true,
                content: "", // this is the document
                consentcontent: null, // this is the consentcontent object
                userdata: null,
                consentloading: false
            }
        },
        computed: {
            ...mapGetters("caseroom", ['getParticipantFullname', 'getParticipantRole_DE', 'getCurrentCrId']),

        },
        asyncComputed: {
            participantData: {
                get() {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            var ul = this.involved_users ? this.involved_users.length : 0
                            if (ul > 0) {
                                this.$store.dispatch('auth/getMinimalUserProfiles', {usernames: this.involved_users})
                                    .then((response) => resolve(response))
                                    .catch((e) => reject(e))
                            } else reject()
                        }, 1000)
                    })
                },
                default: null
            }
        },
        methods: {
            roles_de: function (roles) {
                return roles.map((x) => this.$store.state.auth.userroles[x]).join()
            },
            accept: function () {
                var config = {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${this.$store.state.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_CONSENT"],
                    data: {
                        'consent_content': this.consentcontent.id,
                        'involved_users': this.involved_users,
                        'referring_Caseroom': this.getCurrentCrId,
                    }
                };
                axios(config).then(() => {
                    this.$emit('consentdecision', true)
                }).catch((e) => {
                    console.log('Consent creation failed: ', e)
                })
                this.dialog = false
            },
            decline: function () {
                this.$emit('consentdecision', false)
                this.dialog = false
            }
        },
        mounted() {
            this.consentloading = true
            // get the latest consent entry of the specified type
            var config = {
                method: 'GET',
                url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX + 'recent_consent_doc/',
                headers: {
                    authorization: `Bearer ${this.$store.state.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                xhrFields: {
                    withCredentials: true
                },
                params: {consent_type: this.consent_type}
            };
            // retrieve the document
            axios(config).then((response) => {
                this.consentcontent = response.data
                var config2 = {
                    method: 'GET',
                    url: this.consentcontent.document,
                    headers: {
                        authorization: `Bearer ${this.$store.state.token}`,
                        'Content-Type': 'application/json'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                };
                axios(config2).then((response2) => {
                    this.content = response2.data;
                }).then(() => {
                    if (this.involved_users) {
                        this.$store.dispatch('auth/getMinimalUserProfiles', {usernames: this.involved_users})
                            .then((response) => {
                                this.$store.commit('caseroom/setParticipants', response)
                            })
                    }
                })
            }).finally(() => this.consentloading = false)
        },
        props: {
            consent_type: String,
            involved_users: Array,
            new_user: String,
            omitButtons: Boolean,
        },
    };
</script>
