<template>
    <v-form>
    <v-row dense>
        <v-col>
        <v-text-field v-model="first_name" :error-messages="nameErrors" label="Vorname" required
         @input="$v.first_name.$touch()"
        @blur="$v.first_name.$touch()"
        ></v-text-field>
        </v-col>
        <v-col>
        <v-text-field v-model="last_name"  label="Nachname" required
         @input="$v.last_name.$touch()"
        @blur="$v.last_name.$touch()"
        ></v-text-field>
    </v-col>
        </v-row>
         <v-btn
          color="primary"
          outlined
          class="ma-2"
          dark
          @click="submit"
        >Name speichern

        </v-btn>
        </v-form>
</template>

<script>

    import { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'


    export default {
        mixins: [validationMixin],

    validations: {
      first_name: { required},
        last_name: { required}


    },
        data: () => ({
            valid:false,
            first_name:'',
            last_name:'',
        }),
        mounted() {
          if (this.first_name_value) {
              this.first_name=this.first_name_value
          }
            if (this.last_name_value) {
              this.last_name=this.last_name_value
          }
        },
        computed: {
            nameErrors () {
                const errors = []
                if ((!this.$v.first_name.$dirty) || (!this.$v.last_name.$dirty)) return errors
                !this.$v.first_name.required && !this.$v.last_name.required && errors.push('Erforderlich.')
                return errors
              },
        },
        methods: {
            submit () {
                let first_name=this.first_name
                let last_name=this.last_name
             this.$v.$touch()
                this.$store.dispatch('auth/updateAccountDetails',{'first_name':first_name,'last_name':last_name})
                .then(()=> {
                    this.$emit('newName')
                }).catch(()=> {
                    this.$emit('error')
                })
        },

        },

        props: {
            first_name_value: String,
            last_name_value: String,
        }
    };
</script>