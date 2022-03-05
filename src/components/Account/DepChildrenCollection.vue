<template>
    <v-container>
     <v-row dense>
         <v-col>
        <v-chip-group
        v-model="selection"
        active-class="deep-purple--text text--accent-4"
        column
      >

        <v-chip
                class="ma-2"
                v-for="child in children_array"
                :key="child.username"
                color="green"
                outlined
                @click="returnchild ? returnselectedchild(child) : childdetail=!childdetail"
        >
            <v-icon>
                mdi-account-child-circle
            </v-icon>
            {{ childdetail ? child.email : child.name }}

            </v-chip>
     </v-chip-group>
             </v-col>
         <v-col>
            <v-btn
      class="mx-2"
      dark outlined
      color="indigo"
      @click="addchild=true"
    >
        Kind hinzufügen
    </v-btn>
    </v-col>
</v-row>

  <v-form v-model="valid"
  v-show="addchild"
  @submit.prevent="addchilduser({email, first_name, last_name,birthday})"
  ref="registerForm">
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="first_name"
            :rules="nameRules"
            label="Vorname"
            required
          ></v-text-field>
        </v-col>

        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="last_name"
            :rules="nameRules"
            label="Nachname"
            required
          ></v-text-field>
        </v-col>

        <v-col
          cols="12"
          md="4"
        >
      <v-text-field v-model="email" :error-messages="emailErrors"  label="E-mail" required
         @input="$v.email.$touch()"
        @blur="$v.email.$touch()"

        ></v-text-field>
        </v-col>

          <v-col
          cols="12"
          md="4"
                  >
                      <BirthdayPicker
                              required
                      @updateBirthday="onUpdateBirthday">

                      </BirthdayPicker>
                  </v-col>
      </v-row>
    <v-row>
        <v-col>
            <div class="text-center">
            <v-btn
              class="ma-2"
              outlined
              color="indigo"
              @click="reset"
            ><v-icon>mdi-cancel</v-icon>
              Abbrechen
            </v-btn>

            <v-btn
              class="ma-2"
              outlined
              color="indigo"
              type="submit"
                :disabled="!valid || birthday.length<1"
            >
              <v-icon>mdi-check</v-icon>
                Kind hinzufügen
            </v-btn>
         </div>
            </v-col>
        </v-row>
    </v-container>
  </v-form>

        <v-row>
            <v-container
                v-if="showconsent"
                >
            <ConsentForm
                consent_type="P1B"
                :involved_users="children_array.map(x => x.username)"
                @consentdecision="onConsentDecision"
      ></ConsentForm>

            </v-container>
        </v-row>

    </v-container>
</template>

<script>

 import BirthdayPicker from "@/components/Account/BirthdayPicker";
 import ConsentForm from "@/components/ConsentForm/ConsentForm";
   import { validationMixin } from 'vuelidate'
  import { email } from 'vuelidate/lib/validators'

require('datejs');
Date.i18n.setLanguage('de-DE');

 export default {
     components: {BirthdayPicker,ConsentForm},
     props: {
         returnchild: Boolean,
          children:Array,
         loadChildren:Boolean,
         passed_firstname: String,
         passed_lastname: String,
         passed_birthday_date: String,
         passed_email: String,
      },
            mixins: [validationMixin],

        validations: {
            email: {
                email,

            }
        },
    data: () => ({
        children_array:[],
        current_child:'',
        selection:null,
        childdetail:false,
        addchild:false,
      valid: false,
        proofs:[],
        showconsent:false,
      first_name: '',
      last_name: '',
        email_text:"",
        birthday:'',
      nameRules: [
        v => !!v || 'Name is required',
      ],


        consented:false,

    }),
      computed: {
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
          emailErrors () {
                const errors = []
                if (!this.$v.email.$dirty) return errors
                !this.$v.email.email && errors.push('Bitte eine gültige Email-Adresse eingeben.')
                return errors
              },
        },
      mounted(){
        if (this.loadChildren){
            this.getChildrenDetails()
        } else {
            this.children_array=this.children
        }
        this.first_name=this.passed_firstname ? this.passed_firstname : ''
          this.last_name=this.passed_lastname ? this.passed_lastname : ''
          this.birthday=this.passed_birthday_date ? Date.parse(this.passed_birthday_date).toString('yyyy-MM-dd') : ''
            this.email_text=this.passed_email ? this.passed_email : ''
      },
      methods: {
          getChildrenDetails: function() {
                      this.$store.dispatch(('auth/getDependentChildren'))
                          .then((response) => {
                              this.children_array = response;
                          }).catch((e) => {
                          console.log(e)
                      })

            },
         reset: function () {
             this.first_name=''
             this.last_name=''
             this.birthday=''
             this.email_text=''
             this.addchild=false
             this.proofs=[]
             this.consented=false
             this.current_child=''
        },

         onUpdateBirthday(payload){
             this.birthday=payload.date
         },
        addchilduser: function ({email, first_name, last_name, birthday}) {
            if (this.$refs.registerForm.validate()) {
                  this.$store.dispatch('auth/registerChild', {email, first_name, last_name, birthday})
                      .then((response) => {
                              console.log('Dependent Child added')
                              this.children_array.push({'username':response.data.username,'name':response.data.first_name+' '+response.data.last_name})
                            if (this.returnchild) {
                                this.returnselectedchild(response.data)
                            }
                            this.current_child=response.data.username
                          this.showconsent=true
                      }).catch((e)=> {
                          console.log('error while adding child ', e)
                          }).finally(()=> {
                            this.addchild=false
                            this.reset()
                  });

        }
            },

          onUpdateProofs(payload) {
              const p=payload.uploaded
              console.log('Uploaded ',p)
             p.forEach((proof) => {
                 console.log('Which is ',proof)
                 this.proofs.push(proof)
             })
         },
          onConsentDecision: function(payload) {
           this.consented=payload
              if (this.consented) {
                  this.reset()
                  this.$emit('childAdded')
              } else {
                    this.$store.dispatch('auth/deleteChild',{username:this.current_child})
                        .then(()=> {
                            this.reset()
                            this.getChildrenDetails()
                        })
              }
        },
          returnselectedchild: function(payload) {
              this.$emit('userselected',payload)
          }
      },


  }

</script>