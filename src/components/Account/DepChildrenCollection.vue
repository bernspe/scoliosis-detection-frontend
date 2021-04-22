<template>
    <v-container>
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
                @click="childdetail=!childdetail"
        >
            <v-icon>
                mdi-account-child-circle
            </v-icon>
            {{ childdetail ? child.email : child.name }}

            </v-chip>
     </v-chip-group>
            <v-btn
      class="mx-2"
      fab
      dark
      color="indigo"
    >
      <v-icon dark
      @click="addchild=true">
        mdi-plus
      </v-icon>
    </v-btn>



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
                      v-lazy-input:debounce="700"
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
            <v-subheader>Nachweise</v-subheader>
            <v-col
          cols="12"
          md="4"
                  >
            <p v-if="proofs.length==0">Es fehlen noch entsprechende Nachweise (Abstammungsurkunde, Foto der Versichertenkarte o.ä.).</p>
            <v-list v-for="p in proofs" :key="p.id">
                <v-list-item>
                    <v-list-item-title>{{p.id}}</v-list-item-title>
                    <v-list-item-avatar> <v-img :src="p.img"></v-img></v-list-item-avatar>
                </v-list-item>
            </v-list>
                 <ProofUploadDialog2
                             proof_type="caregiver certificate"
                             @updateProofs="onUpdateProofs"
                             ></ProofUploadDialog2>
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
              :disabled="!valid || birthday.length<1 || (proofs.length==0)"
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
                @consentDecision="onConsentDecision"
      ></ConsentForm>

            </v-container>
        </v-row>

    </v-container>
</template>

<script>

 import BirthdayPicker from "@/components/Account/BirthdayPicker";
 import ConsentForm from "@/components/ConsentForm/ConsentForm";
   import { validationMixin } from 'vuelidate'
  import { required, email } from 'vuelidate/lib/validators'
import {lazyInput} from 'vue-lazy-input'
 import ProofUploadDialog2 from "@/components/Account/ProofUploadDialog2";


 export default {
     components: {BirthdayPicker,ConsentForm,ProofUploadDialog2},
     props: {
          children:Array,
         loadChildren:Boolean,
      },
            mixins: [validationMixin],

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
        children_array:[],
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
                !this.$v.email.required && errors.push('Erforderlich.')
                !this.$v.email.isUnique && errors.push('Diese Email Adresse ist schon vergeben.')
                return errors
              },
        },
      mounted(){
        if (this.loadChildren){
            this.getChildrenDetails()
        } else {
            this.children_array=this.children
        }
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
                          this.addchild=false
                          this.showconsent=true
                      }).catch((e)=> {
                              console.log('error while adding child ', e)
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
              if (payload) {
                  this.$emit('childAdded')
              }
        }
      },
     directives:{
      lazyInput
    }

  }

</script>