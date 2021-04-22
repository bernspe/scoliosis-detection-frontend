<template>
  <div class="mt-8 text-center" margin-top="60px">
    <div class="d-flex justify-center mb-6">
        <v-card>

            <v-card-title>
              {{ getterFirstname }}, deine EMail-Adresse wird verifiziert.
            </v-card-title>

            <v-card-subtitle>
                <span v-if="isSuccessful">Verifizierung erfolgreich.</span>
                <span v-if="hasFailed">Verifizierung nicht erfolgreich.</span>
            </v-card-subtitle>

                            <v-card-actions>
                                  <v-btn color="primary" @click="pushLogin" :enabled="hasFailed">
                                             Login
                                  </v-btn>
                              <v-spacer></v-spacer>
                              <v-slide-x-reverse-transition>
                                <span v-if="hasFailed" class="text-caption red--text"
                                  >Bitte versuch es nochmal!</span
                                >
                              </v-slide-x-reverse-transition>
                              <v-progress-circular
                                v-if="isLoading"
                                indeterminate
                                color="primary"
                                :size="20"
                                :width="2"
                              ></v-progress-circular>
                            </v-card-actions>

</v-card>
    </div></div>
</template>

<script>
    import {mapGetters, mapState} from "vuex";
    import {STATUS as AUTH_STATUS} from "@/store/modules/auth";
    import router from "@/router";

    export default {
        name: "emailactivation",
        mounted () {
              var username = this.$route.params.username
                var token= this.$route.query.token
                this.$store.dispatch('auth/checkEmail', {username, token}).then(()=> {
                    router.push('/')
                })
            },
        methods: {
           pushLogin() {
               router.push('/login')
           }
        },
          computed: {
            //username: this.$route.params.username,
            ...mapGetters("auth", ["isAuthenticated", 'getterFirstname']),
              ...mapState({
                    authStatus: state => state.auth.status,

                }),
              isSuccessful() {
                return this.authStatus === AUTH_STATUS.success;
              },

              isLoading() {
                 return this.authStatus === AUTH_STATUS.loading;
                },
              hasFailed() {
                 return this.authStatus === AUTH_STATUS.error;
               }
          },
        props: {
        },
    };
</script>
