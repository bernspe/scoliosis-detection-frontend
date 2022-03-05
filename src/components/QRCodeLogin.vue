<template>
    <v-card class="ma-2 pa-2">
        <v-row dense>
            <v-col>
               <v-card-title>
                Login mit QR Code
                </v-card-title>
            </v-col>
            <v-col>
               <v-progress-circular
                    v-if="loading"
                    indeterminate
                    color="primary"
                    :size="50"
                    :width="2"
                  ></v-progress-circular>
            </v-col>
        </v-row>

        <v-card-subtitle v-if="userobject">
            Dein Name: {{ userobject.name }}
        </v-card-subtitle>
        <v-card-subtitle v-if="userobject">
            Dein Geburtstag: {{ formatDate(userobject.date_of_birth) }}
        </v-card-subtitle>
        <v-card-actions>
            <v-btn class="ma-2" color="success" @click="proceedLogin" outlined>Ist korrekt!</v-btn>
            <v-spacer></v-spacer>
            <v-btn class="ma-2" color="error" @click="abortLogin" text>Nein, das bin ich nicht.</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import {run_init_after_auth} from "@/initblock2";
    import {mapGetters} from "vuex";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        name: 'Qrcodelogin',
        mixins: [component_tracer],
        data() {
          return {
              userobject:null,
              error:false,
              loading:false,
          }
        },
        mounted() {
            var username=this.$route.query.username
            this.loading=true
            this.$store.commit('auth/resetAuthStatus')
            this.$store.commit('auth/loginRequest')
            this.$store.dispatch('auth/getMinimalUserProfilesFromCurrentlyLoggedInUser',{username: username})
            .then((res) => this.userobject=res)
            .catch(()=> {
                this.error = true
                this.$router.push('/preview')
            })
            .finally(() => {
                this.loading = false
                if (this.userobject.username.length===0) {
                    this.$router.push('/preview')
                }

            })
        },
        computed: {
            ...mapGetters(['getterDevice']),
        },
        methods: {
            proceedLogin: function() {
                var this1=this
                //var email= this.$route.query.email
                var username=this.$route.query.username
                var notify=this.$route.query.notify
                var password='startpass'
                this.$store.commit('auth/resetAuthStatus')
                this.$store.dispatch('auth/loginWQRCode', {username, password, notify})
                      .then(() => {
                           run_init_after_auth(this1)
                          // das einwählende Gerät für FastLogin erlauben
                          let device=this.getterDevice;
                          this.$store.dispatch('auth/addDevice',device)
                            .then(()=> {
                                this.$store.dispatch('auth/getDevices')
                            })
                            }).catch((e) => {
                              console.log(e);
                            })

            },
            abortLogin() {
                var username=this.$route.query.username
                var notify=this.$route.query.notify
                this.$store.dispatch('auth/denyQRCodeLogin',{username:username,notify:notify})
                .finally(()=> this.$router.push('/preview'))
            },
            formatDate (date) {
                const [year, month, day] = date.split(/-|T/)
                return (day + '.' + month + '.' + year)
            },
        }

    };
</script>
