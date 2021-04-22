<template>
    <v-form>
    <v-col cols="12">
        <v-text-field v-model="email" :error-messages="emailErrors"  label="E-mail" required
         @input="$v.email.$touch()"
        @blur="$v.email.$touch()"
                      v-lazy-input:debounce="700"
        ></v-text-field>
    </v-col>
         <v-btn
          color="primary"
          dark
          @click="submit"
        >EMail ändern
            <v-icon
                    right
                    dark
                  >
                    mdi-at
                  </v-icon>
        </v-btn>
        </v-form>
</template>

<script>

    import { validationMixin } from 'vuelidate'
  import { required, email } from 'vuelidate/lib/validators'
import {lazyInput} from 'vue-lazy-input'

    export default {
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
            valid:false,
            email:'',
        }),
        mounted() {
          if (this.value) {
              this.email=this.value
          }
        },
        computed: {
            emailErrors () {
                const errors = []
                if (!this.$v.email.$dirty) return errors
                !this.$v.email.email && errors.push('Bitte eine gültige Email-Adresse eingeben.')
                !this.$v.email.required && errors.push('Erforderlich.')
                !this.$v.email.isUnique && errors.push('Diese Email Adresse ist schon vergeben.')
                return errors
              },
        },
        methods: {
            submit () {
                let email=this.email
             this.$v.$touch()
                this.$store.dispatch('auth/updateAccountDetails',{'email':email})
                .then(()=> {
                    this.$emit('newEmail')
                }).catch(()=> {
                    this.$emit('error')
                })
        },

        },

    directives:{
      lazyInput
    },
        props: {
            value: String,
        }
    };
</script>