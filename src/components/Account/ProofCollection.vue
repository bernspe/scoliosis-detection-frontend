<template>
    <v-container>
     <v-chip-group
        v-model="selection1"
        active-class="deep-purple--text text--accent-4"
        column
      >
                   <v-subheader
            v-show="existingproofs.length>0"
          >Bereits vorhanden: </v-subheader>
        <v-chip
                class="ma-2"
                v-for="(proof,index) in existingproofs"
                :key="index"
                :color="colorfromstatus(existingproofs_checkstatus[index])"
                outlined
        >
            <v-icon>
                mdi-book-check
            </v-icon>
            {{ prooftranslations[proof] }}
                    </v-chip>
     </v-chip-group>
      <v-chip-group
        v-model="selection2"
        active-class="deep-purple--text text--accent-4"
        column
      >
          <v-subheader
            v-show="necessaryproofs.length>0"
          >Noch zu übermitteln: </v-subheader>
          <div
                v-for="proof in necessaryproofs"
                :key="proof">
          <v-chip
                class="ma-2"

                color="orange"
                >
            {{ prooftranslations[proof] }}

                    </v-chip>
              <ProofUploadDialog2
                             :proof_type="proof"
                             @updateProofs="onUpdateProofs"
                             ></ProofUploadDialog2>
              </div>
      </v-chip-group>

    </v-container>
</template>

<script>

 import ProofUploadDialog2 from "@/components/Account/ProofUploadDialog2";
 import axios from "axios";
 export default {
     components: {ProofUploadDialog2},
     props: {
          requestedproofs:Array,
      },
    data: () => ({
        existingproofs:[],
        existingproofs_checkstatus:[],
        missingproofs:[],
        selection1: null,
        selection2: null,
        prooftranslations: {
            'id': 'Personalausweis/Reisepass',
            'caregiver certificate': 'Abstammungsurkunde o.ä. Dokument',
            'dr-id': 'Arztausweis',
        }

    }),
      computed: {
        necessaryproofs: function()  {
            var initial_missing_proofs= this.missingproofs.concat(this.requestedproofs.filter((item) => this.missingproofs.indexOf(item) < 0))
            let p=[]
            if (initial_missing_proofs) {
                initial_missing_proofs.forEach((val) => {
                    if (!this.existingproofs.includes(val)) {
                        p.push(val)
                    }
                })
            }
        return p
      },
        },
     watch: {
       missing_proofs(newValue, oldValue) {
           if ((newValue.length == 0) & (oldValue.length>=0)) {
               this.$emit('noMissingProofs')
           }
       }
     },
      created(){
               var config2 = {
                            method: 'GET',
                            url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config2).then((response2)=>{
                        response2.data.existing.forEach((proof) => {
                            this.existingproofs.push(proof.proof_type)
                            this.existingproofs_checkstatus.push(proof.checkedby)
                             })
                        response2.data.missing.forEach((prooftype) => {
                            this.missingproofs.push(prooftype)
                        })
                    }).catch((e)=> {
                        console.log(e)
                    })

      },
      methods: {
         onUpdateProofs(payload) {
             const p=payload.uploaded
             p.forEach((proof) => {
                 this.existingproofs.push(proof.proof_type)
             })

         },
          colorfromstatus(val) {
             if (val) {
                 return "green"
             } else {
                 return "orange"
             }
          }

      },

  }

</script>