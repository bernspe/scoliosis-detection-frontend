<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="400px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
                outlined
          color="primary"
          v-bind="attrs"
          v-on="on"
        > <div v-if="$vuetify.breakpoint.smAndUp">
            {{ label }}</div>
            <v-icon
                    right
                  >mdi-form-textbox-password
                  </v-icon>
        </v-btn>
      </template>

   <v-stepper
    v-model="e6"
    vertical
  >
    <v-stepper-step
      :complete="e6 > 1"
      step="1"
    >
      Token versenden
      <small>Ein Email Token ist erforderlich</small>
    </v-stepper-step>

    <v-stepper-content step="1">
      <v-card
        color="grey lighten-1"
        class="mb-12"
        height="100px"
      >
          <v-card-text>
              Mit dem Click auf WEITER versendest Du einen Token an Deine EMail Adresse.
          </v-card-text>
      </v-card>
      <v-btn
        color="primary"
        @click="sendToken"
      >
        Weiter
      </v-btn>
        <v-spacer></v-spacer>
        <v-progress-circular
                    v-if="isLoading"
                    indeterminate
                    color="primary"
                    :size="20"
                    :width="2"
                  ></v-progress-circular>
      <v-btn text
      @click="reset">
        Abbrechen
      </v-btn>
    </v-stepper-content>
    <v-stepper-step
      :complete="e6 > 2"
      step="2"
    >
      Token erhalten
      <small>Schau in Dein Postfach</small>
    </v-stepper-step>

    <v-stepper-content step="2">

       <v-card
              color="grey lighten-1"
        class="mb-12"
        height="150px">
              <v-card-text
          >
              Wir haben Dir per eMail einen Token aus 6 Zeichen gesendet. Schau bitte in deinem Postfach nach, ob du eine EMail von skoliosekinder@gmail.com bekommen hast.
          </v-card-text>

       </v-card>
        <v-btn
        color="green"
        @click="sendToken"
      >
        Token nochmal senden
      </v-btn>
        <v-spacer></v-spacer>
        <v-progress-circular
                    v-if="isLoading"
                    indeterminate
                    color="primary"
                    :size="20"
                    :width="2"
                  ></v-progress-circular>

        <v-btn
        color="primary"
        @click="e6 = 3"
      >
        Weiter
      </v-btn>
      <v-btn text @click="reset">
        Abbrechen
      </v-btn>
    </v-stepper-content>

     <v-stepper-step
      :complete="e6 > 3"
      step="3"
    >
      Neues Passwort
      <small>Gib Dein neues Passwort ein</small>
    </v-stepper-step>

    <v-stepper-content step="3">

       <v-card
              color="grey lighten-1"
        class="mb-12"
        height="300px">

        <v-card-text>
                <v-text-field
                        v-model="password"
                        :append-icon="show1?'eye':'eye-off'"
                        :rules="[rules.required, rules.min]"
                        :type="show1 ? 'text' : 'password'"
                        name="input-10-1"
                        label="Neues Passwort"
                        hint="Mindestens 4 Zeichen"
                        counter @click:append="show1 = !show1"></v-text-field>

                <v-text-field block
                              v-model="verify"
                              ref="verifyinputfield"
                              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                              :rules="[rules.required, passwordMatch]"
                              :type="show1 ? 'text' : 'password'"
                              name="input-10-1"
                              label="Passwort bestätigen"
                              counter @click:append="show1 = !show1"></v-text-field>

                <v-text-field block
                              v-model="emailtokeninput"
                              ref="emailtokeninputfield"
                              :rules="[rules.required, rules.minToken]"
                              type="text"
                              name="input-10-1"
                              label="Token aus Email eingeben"
                              hint="Bitte gib den 6-stelligen Token aus der Email ein."
                              counter @click:append="show1 = !show1"></v-text-field>
        </v-card-text>
      </v-card>
        <v-btn color="blue darken-1" text @click="reset">Abbrechen</v-btn>
          <v-btn color="blue darken-1" text @click="newPasswordLogin">Fertig</v-btn>
    </v-stepper-content>
   </v-stepper>
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


  export default {
      props: {
          user: Object,
          email: String,
          label: String,
      },
      data: () => ({
          e6:1,
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
             this.e6=1
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
                      this1.e6=2
                  } else {
                      if (!this1.username) {
                          this1.username=response.data.username
                          this1.passwordsent = true
                            this1.e6=2
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
                            this.e6=1
                            this.emailtokeninput=''
                          });
                  this.dialog=false
              }
          },
      }
  }
</script>