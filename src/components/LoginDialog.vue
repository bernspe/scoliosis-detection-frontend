
<template>
        <v-dialog v-model="dialog" persistent max-width="600px" min-width="360px">
            <div>
                <v-tabs id="LoginTab" v-model="tab" show-arrows background-color="deep-purple accent-4" icons-and-text dark grow>
                    <v-tabs-slider color="purple darken-4"></v-tabs-slider>
                    <v-tab v-for="i in tabs" v-bind:key="i.name">
                        <v-icon large>{{ i.icon }}</v-icon>
                        <div class="caption py-1">{{ i.name }}</div>
                    </v-tab>

                    <v-tab-item>
                        <v-card class="px-4">
                            <v-form @submit.prevent="login({ email, password })"
                                    ref="loginForm"
                                    v-model="valid"
                                    lazy-validation>
                            <v-card-text>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                    v-model="email"
                                                    data-cy="email_field"
                                                    :rules="emailRules"
                                                    ref="emailfield"
                                                    label="E-mail" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field
                                                    v-model="password"
                                                    data-cy="password_field"
                                                    :append-icon="show1?'eye':'eye-off'"
                                                    :type="show1 ? 'text' : 'password'"
                                                    name="input-10-1"
                                                    label="Passwort"
                                                    counter @click:append="show1 = !show1"></v-text-field>
                                        </v-col>

                                    </v-row>
                            </v-card-text>
                            <v-divider class="mt-8"></v-divider>
                            <v-card-actions>
                                <v-row dense>
                                <v-col>
                                    <v-btn data-cy="login_button"
                                            color="primary"
                                            text type="submit"
                                            :disabled="isLoading">
                                             Anmelden
                                  </v-btn>
                                </v-col>
                                    <v-col>
                                <NewPasswordDialog
                                        v-if="email"
                                 :email="email"
                                        label="Passwort vergessen"
                                 >
                                </NewPasswordDialog>
                                        </v-col>
                                </v-row>

                                  <v-spacer></v-spacer>
                              <v-slide-x-reverse-transition>
                                <span v-if="hasFailed" class="text-caption red--text"
                                  >Bitte versuch es nochmal.</span
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
                        </v-form>
                        </v-card>

                    </v-tab-item>
                    <v-tab-item>
                        <v-card class="px-4">
                            <v-card-text>
                                <v-form @submit.prevent="register({ email, firstName, lastName })" ref="registerForm" v-model="valid" lazy-validation>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="firstName" :rules="[rules.required]" label="First Name" maxlength="20" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="lastName" :rules="[rules.required]" label="Last Name" maxlength="20" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
                                        </v-col>

                                        <v-spacer></v-spacer>
                                        <v-divider class="mt-8"></v-divider>
                                        <v-card-actions>
                                        <v-btn color="primary" text type="submit" :disabled="isLoading">
                                             Register
                                        </v-btn>
                                          <v-spacer></v-spacer>
                                          <v-slide-x-reverse-transition>
                                            <span v-if="hasFailed" class="text-caption red--text"
                                              >Bitte versuch es nochmal.</span
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
                                    </v-row>
                                </v-form>
                            </v-card-text>

                        </v-card>
                    </v-tab-item>
                </v-tabs>

            </div>

        </v-dialog>

</template>

<script>
    import {mapGetters, mapState} from "vuex";

import { STATUS as AUTH_STATUS } from "@/store/modules/auth";

    import NewPasswordDialog from "@/components/Account/NewPasswordDialog";
    import {run_init_after_auth} from "@/initblock2";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        components: {NewPasswordDialog},
        name:'logindialog',
        mixins: [component_tracer],
      computed: {
        ...mapGetters("auth", ["isAuthenticated",'getterFirstname','getterUsername']),
        ...mapState({
          authStatus: state => state.auth.status,
            userroles: state => state.userroles,
        }),
        email: {
          set: function(val) {
            if (val) {
                this.email_text = val.toLowerCase();
            }
          },
          get: function() {
            return this.email_text;
          }
        },
        isLoading() {
          return this.authStatus === AUTH_STATUS.loading;
        },
        hasFailed() {
          return this.authStatus === AUTH_STATUS.error;
        },

      },

      methods: {
          getImgUrl(pic) {
                return require('../assets/'+pic)
        },

          login: function({email, password}) {
              var this1=this
              var notify=this.issuing_user_notification
              if (this.$refs.loginForm.validate()) {
                  if (password=='') { password='startpass'}
                  this.$store.commit('auth/resetAuthStatus')
                  this.$store.dispatch('auth/login', {email, password, notify})
                      .then(() => {
                          run_init_after_auth(this1)
                          /*
                          this.initializeSession().then(() => {
                            console.log('Login Success')
                              router.push('/');*/
                          }).catch((e) => {
                              //Handling of login error

                              console.log(e);
                          }).finally(()=> {
                              // fire websocket message to issuing user

                  });

              }
          },
        initializeSession() {
              const this1 = this;
              return new Promise((resolve, reject) => {
                  this1.$store.dispatch('auth/checkToken').then(() => {
                      const username = this1.getterUsername;
                      console.log('Username: ',username);
                      this1.$connect(this1.$store.state.endpoints.webSocket + 'user/' + username + '/', {
                          format: 'json',
                          store: this1.$store
                      })
                      if (this1.$store.getters['auth/isCaregiver']) {
                        this1.$nextTick(() => {
                          this1.$store.dispatch('auth/getDependentChildren')
                        })
                      }
                        if (this1.$store.getters['auth/isMed']) {
                          this1.$nextTick(() => {
                            this1.$store.dispatch('auth/getMyPatients')
                          })
                        }
                      this1.$nextTick(()=>{
                            this1.$store.dispatch('auth/getUserRolesDict')
                         })
                      resolve()
                  }).catch(e => {
                      console.log('Error during Websocket init: ', e);
                      reject(e)
                  })

              })
        },

          register:function({email, firstName, lastName}) {
              var np=this.newpassword
                if (this.$refs.registerForm.validate()) {
                  this.$store.dispatch('auth/register', {email:email, password: np, firstName:firstName, lastName:lastName})
                      .then(() => {
                          run_init_after_auth(this)
                          /*
                          this.initializeSession().then(() => {
                            router.push('/')
                          }).catch((e) => {
                              //Handling of register error
                              console.log(e);
                          });*/
                      }).catch((e)=> {
                          this.$store.commit('auth/resetAuthStatus')
                          console.log(e)
                  })
              }

        },

        reset() {
          this.$refs.form.reset();
        },
        resetValidation() {
          this.$refs.form.resetValidation();
        }

      },

      data: () => ({
        dialog: true,
        tab: 0,
        tabs: [
            {"name":"Login", "icon":"mdi-account"},
            {"name":"Register", "icon":"mdi-account-outline"}
        ],
        valid: true,

        firstName: "",
        lastName: "",
        email_text:"",
          password:"",
        newpassword: process.env['VUE_APP_DEFAULT_PASSWORD'],
        verify: "",
          emailtokeninput:"",
        username: "",
        emailRules: [
          v => !!v || "Erforderlich.",
          v => /.+@.+\..+/.test(v) || "Bitte eine gültige Email-Adresse eingeben."
        ],
        show1: false,
        rules: {
          required: value => !!value || "Erforderlich.",
          min: v => (v && v.length >= 4) || "Mindestens 4 Zeichen",
            minToken: v => (v && v.length == 6) || "Genau 6 Zeichen"
        },
        issuing_user_notification: null,
      }),
        props: {
        },
    };
</script>

