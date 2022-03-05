<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >
            <v-icon>
                mdi-account-plus
            </v-icon>
          {{ label }}
        </v-btn>
      </template>
      <v-card>
          <v-form lazy-validation ref="InviteForm">
        <v-row dense>
            <v-col cols="10">
              <v-card-title>
          <span class="headline">Neuen Teilnehmer einladen</span>
        </v-card-title>
                </v-col>
            <v-col cols="2">
                <v-btn icon v-if="!dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                        <v-icon>mdi-information-outline</v-icon>
                                    </v-btn>
                                    <v-btn icon v-if="dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                        <v-icon>mdi-information</v-icon>
                                    </v-btn>
            </v-col>
            </v-row>
          <v-card-subtitle>
              Du kannst per QRCode einladen, wenn der zukünftige Teilnehmer bei dir ist und sein Mobiltelefon dabeihat, du kannst auch per eMail einladen oder eine pdf-Einladung (Post-Adresse) generieren.
          </v-card-subtitle>
        <v-card-text>

            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                        v-model="first_name"
                  label="Vorname"
                  required
                        :rules="[rules.required]"
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                        v-model="last_name"
                  label="Nachname"
                  required
                        :rules="[rules.required]"
                ></v-text-field>
              </v-col>
                <v-col    cols="12"
                sm="6"
                md="4">

                    <BirthdayPicker
                              :birthday_date="getterUserToInviteBirthday"
                      @updateBirthday="onUpdateBirthday">
                      </BirthdayPicker>
                </v-col>


              <v-col cols="12" id="tracer_inviteuser_email">
                <v-text-field v-model="email" :error-messages="emailErrors"  label="E-mail" required
                 @input="$v.email.$touch()"
                @blur="$v.email.$touch()"
                              v-lazy-input:debounce="500"

                ></v-text-field>
                  </v-col>
             <v-col
                cols="6"
                sm="6"
                md="4"
                id="tracer_inviteuser_address"
              >
                  <v-textarea
                    v-model="address"
                  label="Adresse"
                  rows="3"
                  >

                  </v-textarea>
             </v-col>
              <v-col
                cols="6"
                sm="6"
                md="4"
              >
                  <div id="tracer_inviteuser_roles"></div>
               <RoleSelector2
                       :label="roleLabel"
                       :value="roles"
                       :audience="population"
                       :ignore_age="true"
                   @updateRole="onUpdateRole"
                    >
               >
                </RoleSelector2>
              </v-col>
            </v-row>

        </v-card-text>
        <v-card-text id="qrcode_panel">
              <v-card-subtitle v-show="login_qrcode">
                  {{ qr_command_text }}
              </v-card-subtitle>
              <v-card-text v-show="login_qrcode">
                        <AuthImg
                              :src="getBaseUrl+login_qrcode"
                              :auth="getterAuthToken"
                              width="300"
                              height="300"
                              :contain="true"
                              :imgonly="true"
                              @authimageloaded="scrolltoqrcode"
                        ></AuthImg>

              </v-card-text>
                <v-card-actions v-show="login_qrcode">
                    <v-btn outlined color="red" @click="login_qrcode=null; isLoading=false">Abbrechen</v-btn>
                </v-card-actions>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
                <v-speed-dial
                      v-model="fab"
                      bottom
                      right
                      direction="left"
                      transition="slide-x-reverse-transition"
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
                            mdi-account-circle
                          </v-icon>
                        </v-btn>
                      </template>
                          <v-btn fab
                                 small
                                 dark
                            color="indigo"
                            @click="inviteViaQrCode(first_name,last_name, address,roles, email,b_day)"
                            v-show="first_name && last_name && email && ((roles.length>0) ||(b_day))"
                          >
                            <v-icon>mdi-qrcode</v-icon>
                          </v-btn>

                          <v-btn
                                  fab
                                  small
                                  dark
                            color="green"
                            @click="inviteViaEmail(first_name,last_name, address,roles, email,b_day)"
                            v-show="first_name && last_name && email && ((roles.length>0) ||(b_day))"
                          >
                            <v-icon>mdi-at</v-icon>
                          </v-btn>
                          <v-btn
                                  fab
                                  small
                                  dark
                            color="blue darken-1"
                            @click="inviteViaAddress(first_name,last_name, address,roles, email,b_day)"
                            v-show="last_name && address && ((roles.length>0) ||(b_day))"
                          >
                            <v-icon>mdi-card-account-mail-outline</v-icon>
                          </v-btn>

                              <v-btn
                                      fab
                                      small
                                      dark
                                color="red"
                                @click="dialog = false"
                                >
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                </v-speed-dial>
            <v-progress-circular
                                v-if="isLoading"
                                indeterminate
                                color="primary"
                                :size="20"
                                :width="2"
                              ></v-progress-circular>
        </v-card-actions>
                        </v-form>
      <v-tour name="InviteUserTour" :steps="tourSteps" :options="tourOptions" :callbacks="dialogTourCallbacks"></v-tour>
      </v-card>
    </v-dialog>

  </v-row>
</template>

<script>
     import BirthdayPicker from "@/components/Account/BirthdayPicker";
  import RoleSelector2 from "@/components/Account/RoleSelector2";
  import {validationMixin} from "vuelidate";
  import {email, required} from "vuelidate/lib/validators";
    import {lazyInput} from 'vue-lazy-input'
  import {mapGetters} from "vuex";
  import AuthImg from "@/components/AuthImg";
     import component_tracer from "@/mixins/component_tracer";


  export default {
      props: {
          label: String,
         name: String,
          population: String,
          caregiver: Boolean,
          clearonmount: Boolean,
      },
      components: {BirthdayPicker,RoleSelector2,AuthImg},
      name: 'InviteUser',
      mixins: [validationMixin,component_tracer],

    validations: {
      email: {
          required, email,
          isUnique(value) {
              // standalone validator ideally should not assume a field is required
              if (value === '') return true
              return this.$store.dispatch('auth/emailExists', {email: value})
          }
      }
    },
    data: () => ({
        fab: false,
        isLoading:false,
      dialog: false,
        dialogInfoSwitch1: false,
        dialogTourCallbacks:{},
        address:"",
        rules: {
            required: value => !!value || "Erforderlich.",
        },
        login_qrcode:null,
        qr_command_text:"",
        qrSuccessFired:false,
    }),
      computed: {
          ...mapGetters(['getterAuthToken']),
          ...mapGetters('auth',['getterInvitedUserLoggedIn']),
          ...mapGetters('userfindinvite',['getterUserToInvite','getterUserToInviteBirthday','getterUserToInviteFullname','getterUserToInviteFirstname','getterUserToInviteLastname','getterUserToInviteEmail','getterUserToInviteRoles']),

          getBaseUrl() { return this.$store.state.endpoints.baseUrl.slice(0,-1) },
          b_day: {
            set: function(val){
                this.$store.commit('userfindinvite/setUserToInviteBirthday',val)
            },
            get: function() {
                return this.getterUserToInviteBirthday
            }
          },
          first_name: {
              set: function(val) {
                    this.$store.commit('userfindinvite/setUserToInviteFirstName',val)
          },
             get: function() {
                 return this.getterUserToInviteFirstname
             }
          },
          last_name: {
              set: function(val) {
                  this.$store.commit('userfindinvite/setUserToInviteLastName',val)
          },
             get: function() {
                 return this.getterUserToInviteLastname
             }
          },
          full_name () {
            return (this.first_name+' '+this.last_name).trim()
          },
          qrUserLoggedIn () {
              let user = this.getterInvitedUserLoggedIn.full_name.trim()
              return user===this.full_name;
          },
        email: {
          set: function(val) {
            this.$store.commit('userfindinvite/setUserToInviteEmail',val)
          },
          get: function() {
            return this.getterUserToInviteEmail
          }
        },
          roles: {
              set: function(val) {
                  this.$store.commit('userfindinvite/setUserToInviteRoles',val)
              },
              get: function() {
                  return this.getterUserToInviteRoles
              }
          },
          roleLabel () {
            return this.first_name ? this.first_name +' ist ...' : ' '
          },

          emailErrors () {
                const errors = []
                if (!this.$v.email.$dirty) return errors
                !this.$v.email.email && errors.push('Bitte eine gültige Email-Adresse eingeben.')
                !this.$v.email.required && errors.push('Erforderlich.')
                !this.$v.email.$pending && !this.$v.email.isUnique && errors.push('Diese Email Adresse ist schon vergeben.')
                return errors
              },
      },
      watch: {
           dialogInfoSwitch1(newVal,oldVal) {
            if (newVal !== oldVal) {
                if (newVal) {
                    this.startTour(true)
                } else this.stopTour()
            }
          },
          dialog(newVal, oldVal) {
              if(newVal && !oldVal) {
                  this.$asyncComputed.tourSteps.update()
              }
               if (!newVal && oldVal) {
                  this.resetDialog()
              }
          },
          qrUserLoggedIn: {
              handler(newVal, oldVal) {
                  if (((newVal) && (!oldVal)) || ((newVal) && (oldVal))) {
                      var username=this.getterInvitedUserLoggedIn.username
                      var name=this.getterInvitedUserLoggedIn.full_name
                      if (username==='DENIED') {
                          this.$emit('userDenied', {name: name})
                      } else {
                          if (!this.qrSuccessFired) {
                              this.$emit('userInvited', {
                                  'mode': 'qrcode',
                                  'username': username,
                                  'name': name
                              })
                          }
                          this.qrSuccessFired=true
                      }
                      this.loading = false
                      this.dialog = false
                  }
              },
              deep: true
          },
      },
      mounted() {
          if (this.clearonmount) this.resetDialog()
        if (this.caregiver) this.roles=['Caregiver']
           var this1=this
            this.dialogTourCallbacks={
                onFinish: () => {this1.dialogInfoSwitch1=false}
            }
      },
      methods: {
          inviteViaQrCode: function (first_name,last_name, address,roles, email,b_day) {
              this.isLoading = true
              first_name=first_name ? first_name.trim() : null
              last_name=last_name ? last_name.trim() : null
              email=email ? email.trim() : null
              this.$store.dispatch('auth/registerInvitedUserQRCode', {first_name, last_name, address, roles, email, b_day})
                  .then((response) => {
                      this.qr_command_text="Bitte lass "+first_name+" jetzt den QRCode einscannen."
                      this.login_qrcode=response.data.login_qrcode
                  }).catch(()=> {
                      this.isLoading=false
                      this.qr_command_text="Ein Fehler ist aufgetreten. Bitte überprüfe deine Angaben oder nutze eine andere Einladungsmöglichkeit."
              })
          },

        inviteViaEmail: function (first_name,last_name, address,roles, email,b_day) {
            this.isLoading=true
              first_name=first_name ? first_name.trim() : null
              last_name=last_name ? last_name.trim() : null
          this.$store.dispatch('auth/registerInvitedUserEmail',{first_name,last_name, address,roles, email,b_day})
          .then((response)=> {
            this.$emit('userInvited',{'mode':'email','username': response.data.username,'name':this.first_name+' '+this.last_name})
          }).then(()=> {
              this.isLoading=false
              this.dialog = false
          })
        },

          inviteViaAddress: function (first_name,last_name, address,roles, email,b_day) {
            this.isLoading=true
              first_name=first_name ? first_name.trim() : null
              last_name=last_name ? last_name.trim() : null
              email=email ? email.trim() : null
            this.$store.dispatch('auth/registerInvitedUserPDF',{first_name,last_name, address,roles, email,b_day})
              .then((response)=> {
                this.$emit('userInvited',{'mode':'pdf','username': response.headers['invited-username'],'name':this.first_name+' '+this.last_name})
                  console.log('PDF Response: ',response)
                  const file = new Blob([response.data],
                      {type: 'application/pdf'});
                            //Build a URL from the file
                            const fileURL = URL.createObjectURL(file);
                            //Open the URL on new Window
                            window.open(fileURL);
              }).then(()=> {
                  this.isLoading=false
                this.dialog = false
            })

          },
        onUpdateBirthday(payload) {
            this.b_day=payload.date
        },

        onUpdateRole(payload) {
          this.roles=payload.value
        },

          resetDialog() {
              this.$store.commit('userfindinvite/clearUserToInvite')
             if (this.$refs.InviteForm) {
                 this.$refs.InviteForm.reset()
                this.$v.email.$reset()
             }
              this.login_qrcode=null
                this.qr_command_text=""
              this.loading=false
          },

          scrolltoqrcode(){
               // funktioniert noch nicht, da Bild noch nicht geladen
              document.getElementById("qrcode_panel").scrollIntoView({ behavior: "smooth" })
          },

      },

      directives:{
      lazyInput
    }
  }
</script>