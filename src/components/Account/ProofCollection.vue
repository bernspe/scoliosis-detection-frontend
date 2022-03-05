<template>
    <v-container>
        <v-row dense>
               <v-col>
                 <v-chip-group
                    v-model="selection1"
                    active-class="deep-purple--text text--accent-4"
                    column
                  >
                               <v-subheader
                        v-show="getterExistingProofs.length>0"
                      >Bereits vorhanden: </v-subheader>
                    <v-chip
                            class="ma-2"
                            v-for="(proof,index) in getterExistingProofs"
                            :key="index"
                            color="green"
                            outlined
                    >
                        <v-icon>
                            mdi-book-check
                        </v-icon>
                        {{ proof.proof_type ? prooftranslations[proof.proof_type] : prooftranslations[proof] }}
                                </v-chip>
                 </v-chip-group>
                </v-col>
            </v-row>

        <v-row dense>
              <v-chip-group
                v-model="selection2"
                active-class="deep-purple--text text--accent-4"
                column
              >
                  <v-subheader
                    v-show="getterMissingProofs.length>0"
                  >Noch zu übermitteln: </v-subheader>
                      <v-container
                            v-for="proof in getterMissingProofs"
                            :key="proof">
                          <v-row dense>
                          <v-col>
                          <v-chip
                            class="ma-2"

                            color="orange"
                            >
                        {{ proof.proof_type ? prooftranslations[proof.proof_type] : prooftranslations[proof]}}

                                </v-chip>
                              </v-col>
                          <v-col>
                              <v-switch
                                  v-model="switch1"
                                  :label="switch1 ? 'Kamera' : 'Datei hochladen'"
                                ></v-switch>
                          </v-col>
                              </v-row>
                          <ProofUploadDialog2 v-if="!switch1"
                                         :proof_type="proof.proof_type ? proof.proof_type : proof"
                                         @updateProofs="onUpdateProofs"
                                         ></ProofUploadDialog2>

                          <v-btn v-if="switch1" outlined class="ma-2" color="primary" @click="startProofCamera=true">Ausweis jetzt fotografieren</v-btn>
                          <Veasycampanel v-if="switch1 && startProofCamera"
                                :owner="getterUsernameSimple"
                                   :program="proof.proof_type ? proof.proof_type : proof"
                                         @VCameraDone="onUpdateProofs"
                          >
                          </Veasycampanel>
                          <!--
                          <Vcameradialog v-if=switch1
                                         :proof_type="proof.proof_type ? proof.proof_type : proof"
                                         :owner="getterUsernameSimple"
                                         :program="proof.proof_type ? proof.proof_type : proof"
                                        @VCameraDone="onUpdateProofs"></Vcameradialog>

                          <VCamera v-if=switch1 :proof_type="proof.proof_type ? proof.proof_type : proof" :owner="getterUsernameSimple" :program="proof.proof_type ? proof.proof_type : proof"
                                   start-on-mounted
                                   @camerastarted="registerCamera"
                                   @VCameraDone="onUpdateProofs"></VCamera> -->
                          </v-container>
                      </v-chip-group>
        </v-row>

        <v-row dense>
            <v-col>
            <v-subheader v-show="getterOverallMissingProofs.length===0">
                Alle Nachweise vorhanden
            </v-subheader>
            </v-col>
            <v-col>
                <v-icon x-large color="green" v-show="getterOverallMissingProofs.length===0">mdi-check</v-icon>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>

 import ProofUploadDialog2 from "@/components/Account/ProofUploadDialog2";
 import {mapGetters} from "vuex";
 import Veasycampanel from "@/components/VCamera/VEasyCamPanel";

 export default {
     components: {Veasycampanel, ProofUploadDialog2},

    data: () => ({
        loadAdditionalProofs:false,
        selection1: null,
        selection2: null,
        switch1: true,
        startProofCamera: false,
        prooftranslations: {
            'id': 'Personalausweis/Reisepass',
            'dr-id': 'Arztausweis',
        },
        camera:null,
    }),
      computed: {
         ...mapGetters('auth',['getterOverallMissingProofs','getterMissingProofs','getterExistingProofs','getterUsernameSimple']),

        },

      methods: {
        registerCamera(payload) {
            this.camera=payload
        },
         onUpdateProofs(payload) {
            if (payload) {
                this.$store.commit('auth/setExistingUserProofs',payload.uploaded)
                this.$emit('proofsuploaded')
            }
            this.startProofCamera=false
        },
          stopCamera() {
            if(this.camera) {
                this.camera.videoElement.srcObject.getTracks().forEach((x) => x.stop())
            }
          }
      },
     watch: {
       switch1(newVal,oldVal) {
          if(newVal && !oldVal) {
              this.stopCamera()
          }
       }
     },

  }

</script>