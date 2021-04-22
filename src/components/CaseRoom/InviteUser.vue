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
          {{ label }}
        </v-btn>
      </template>
      <v-card>
          <v-form lazy-validation>
        <v-card-title>
          <span class="headline">Neuen Teilnehmer einladen</span>
        </v-card-title>
          <v-card-subtitle>
              Du kannst per eMail einladen oder eine pdf-Einladung (Post-Adresse) generieren.
          </v-card-subtitle>
        <v-card-text>
          <v-container>

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
              <v-col cols="12">
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
              >
                  <v-textarea
                    v-model="address"
                  label="Adresse"
                  rows="3">

                  </v-textarea>
             </v-col>
              <v-col
                cols="6"
                sm="6"
                md="4"
              >
               <RoleSelector2
                       :label="roleLabel"
                       :value="[]"
                       :audience="population"
                   @updateRole="onUpdateRole"
               >
                </RoleSelector2>
              </v-col>
            </v-row>
          </v-container>
          <small>*erforderliche Angabe</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="inviteViaEmail(email,first_name,last_name,roles)"
            v-if="email"
          >
            Via Email einladen
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="inviteViaAddress(first_name,last_name,address,roles)"
            v-if="address"
          >
            Per PDF / Post einladen
          </v-btn>

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
    </v-dialog>

  </v-row>
</template>

<script>
  import RoleSelector2 from "@/components/Account/RoleSelector2";
  import {validationMixin} from "vuelidate";
  import {email, required} from "vuelidate/lib/validators";
    import {lazyInput} from 'vue-lazy-input'
  export default {
      props: {
          label: String,
         name: String,
          population: String,
      },
      components: {RoleSelector2},
      mixins: [validationMixin],

    validations: {
      email: { required, email,

            isUnique(value) {
                // standalone validator ideally should not assume a field is required
                if (value === '') return true
                return this.$store.dispatch('auth/emailExists',{email:value})
            }
         }


    },
    data: () => ({
        isLoading:false,
      dialog: false,
      first_name_val:"",
      last_name_val:"",
        email_text:"",
        address:"",
      roles:[],
        rules: {
            required: value => !!value || "Erforderlich.",
        },

    }),
      computed: {
          first_name: {
              set: function(val) {
                    if (val) {
                this.first_name_val = val;
            }
          },
             get: function() {
                 if ((this.name) && (!this.first_name_val))  {
                     return this.name.split(' ')[0]
                 } else {
                     return this.first_name_val
                 }
             }
          },
          last_name: {
              set: function(val) {
                  if (val) {
                this.last_name_val = val;
            }
          },
             get: function() {
                 if ((this.name) && (!this.last_name_val)) {
                     return this.name.split(' ')[1]
                 } else {
                     return this.last_name_val
                 }
             }
          },
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
          roleLabel () {
            return this.first_name+' ist ...'
          },

          emailErrors () {
                const errors = []
                if (!this.$v.email.$dirty) return errors
                !this.$v.email.email && errors.push('Bitte eine gültige Email-Adresse eingeben.')
                !this.$v.email.required && errors.push('Erforderlich.')
                !this.$v.email.isUnique && errors.push('Diese Email Adresse ist schon vergeben.')
                return errors
              },
      },
      mounted() {
      },
      methods: {
        inviteViaEmail: function (email,first_name,last_name,roles) {
            this.isLoading=true
          this.$store.dispatch('auth/registerInvitedUserEmail',{email,first_name,last_name,roles})
          .then((response)=> {
            this.$emit('userInvited',{'user': response.data,'name':this.first_name+' '+this.last_name})
          }).then(()=> {
              this.isLoading=false
              this.dialog = false
          })

        },
          inviteViaAddress: function (first_name,last_name, address,roles) {
            this.isLoading=true
            this.$store.dispatch('auth/registerInvitedUserPDF',{first_name,last_name, address,roles})
              .then((response)=> {
                this.$emit('userInvited',{'user': 'pdf','name':this.first_name+' '+this.last_name})
                  const file = new Blob(
                  [response.data],
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

        onUpdateRole(payload) {
          this.roles=payload.value
        }
      },

      directives:{
      lazyInput
    }
  }
</script>