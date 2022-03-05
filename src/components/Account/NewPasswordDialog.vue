<template>
  <v-row justify="center">
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          v-bind="attrs"
          v-on="on"
          text
          small
        >
            {{ label }}
        </v-btn>
      </template>


       <v-card
        class="ma-2 pa-2"
        >

        <v-card-text class="ma-2 pa-2">
                <v-text-field
                        class="ma-2"
                        v-model="password"
                        :append-icon="show1?'eye':'eye-off'"
                        :rules="[rules.required, rules.min]"
                        :type="show1 ? 'text' : 'password'"
                        name="input-10-1"
                        label="Neues Passwort"
                        hint="Mindestens 4 Zeichen"
                        counter @click:append="show1 = !show1"></v-text-field>

                <v-text-field
                        class="ma-2"
                        block
                              v-model="verify"
                              ref="verifyinputfield"
                              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                              :rules="[rules.required, passwordMatch]"
                              :type="show1 ? 'text' : 'password'"
                              name="input-10-1"
                              label="Passwort bestätigen"
                              counter @click:append="show1 = !show1"></v-text-field>

                <v-text-field
                        class="ma-2"
                        block
                              v-model="emailtokeninput"
                              ref="emailtokeninputfield"
                              :rules="[rules.required, rules.minToken]"
                              type="text"
                              name="input-10-1"
                              label="Zahl aus Email eingeben"
                              hint="Bitte gib die 6-stellige Zahl aus der Email ein."
                              counter @click:append="show1 = !show1"></v-text-field>
        </v-card-text>

        <v-card-actions>
        <v-btn color="success" text @click="newPasswordLogin">Fertig</v-btn>
        <v-btn color="error" text @click="reset">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn
        color="green"
        @click="sendToken"
        text
        :loading="isLoading"
        >Zahl nochmal senden
      </v-btn>
        </v-card-actions>
           </v-card>
    </v-dialog>

          <v-snackbar
      v-model="snackbar"
      timeout="2800"
    >
      {{ snackbar_text }}
          </v-snackbar>
  </v-row>
</template>

<script>


  import component_tracer from "@/mixins/component_tracer";

  export default {
      name: 'NewPasswordDialog',
      mixins: [component_tracer],
      props: {
          user: Object,
          email: String,
          label: String,
      },
      data: () => ({
          dialog: false,
          show1: false,
          snackbar: false,
          snackbar_text:'',
          textSnackbar: null,
          passwordsent: false,
          isLoading:false,
          password: "",
          username:"",
          verify: "",
          token: '',
          emailtokeninput: "",
          tokenSentFailure:false,
          tokenSentSuccess: false,

          rules: {
              required: value => !!value || "Erforderlich.",
              min: v => (v && v.length >= 4) || "Mindestens 4 Zeichen",
              minToken: v => (v && v.length == 6) || "Genau 6 Zeichen"
          }
      }),
      computed: {
          passwordMatch() {
              return () => this.password === this.verify || "Passwörter müssen übereinstimmen";
          },
      },
      watch: {
        dialog(newVal, oldVal) {
            if (newVal && !oldVal) {
                this.sendToken()
            }
        }
      },
      mounted() {
        if (this.user) {
            this.username=this.user.username
        }
      },
      methods: {
          reset: function() {
             this.show1= false
             this.dialog= false
             this.password=''
             this.passwordsent=false
             this.isLoading=false
             this.username=''
          },
          sendToken: function() {
          var email = this.user ? this.user.email : this.email
          var this1=this
          this1.isLoading=true
          this.$store.dispatch('auth/setPasswordEmail', {email})
              .then((response) => {
                  if (response.data.username == this1.username) {
                      this1.passwordsent = true
                  } else {
                      if (!this1.username) {
                          this1.username=response.data.username
                          this1.passwordsent = true
                      }
                  }
                  this1.isLoading=false
              }).catch((e) => {
                  console.log(e)
              this1.isLoading=false
          })
      },
          newPasswordLogin: function() {
              var this1=this
              if (this.$refs.emailtokeninputfield.validate() && this.$refs.verifyinputfield.validate()) {
                  let token = this.emailtokeninput
                  let password=this.password
                  let username= this.user ? this.user.username : this.username
                  this.$store.dispatch('auth/setNewPassword', {username, token, password})
                      .then(() => {
                              this.snackbar_text='Das Passwort wurde entsprechend gesetzt.'
                            this1.$emit('updatePassword',true)
                          this.snackbar=true
                          }).catch(() => {
                              this.snackbar_text='Es ist ein Fehler beim Setzen des Passworts aufgetreten.'
                            this1.$emit('updatePassword', false)
                          this.snackbar=true
                            this.password=''
                            this.username=''
                            this.emailtokeninput=''
                          });
                  this.dialog=false
              }
          },
      }
  }
</script>