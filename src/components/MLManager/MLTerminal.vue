<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
                color="green"
                outlined
                v-bind="attrs"
                v-on="on"
                class="ma-2"
                >Model Terminal
                <v-icon
                    right
                    dark
                  >
                    mdi-console-network-outline
                  </v-icon>
                </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          {{ title }}
        </v-card-title>
      <v-card-text>
        <v-file-input :label="update" v-model="updateFileObj" v-if="update" outlined append-icon="mdi-upload" @click:append="updateFile">

        </v-file-input>
        <v-list>
          <v-list-item-group>
            <v-list-item v-for="f in files" :key="f.id">
              <v-list-item-icon>
            <v-icon v-text="isCodeFile(f.file) ? `mdi-file-code-outline`: `mdi-file`"></v-icon>
          </v-list-item-icon>

              <v-list-item-content>
            <v-list-item-title v-text="dePathFile(f.file)"></v-list-item-title>
          </v-list-item-content>

              <v-list-item-action v-if="isCodeFile(f.file)" @click="update=dePathFile(f.file)">
                  <v-icon>mdi-update</v-icon>
              </v-list-item-action>
              <v-list-item-action v-if="isCodeFile(f.file)" @click="downloadFile(f.file, dePathFile(f.file))">
                  <v-icon>mdi-download</v-icon>
              </v-list-item-action>
              </v-list-item>
          </v-list-item-group>



            </v-list>
      </v-card-text>
      <div v-if="teststarted">
          <v-card-text>
                <v-sheet
                        elevation="8"

                      >
                        <v-slide-group
                          v-model="ml_model_result"
                          class="pa-4"
                          show-arrows
                          center-active
                        >
                            <v-slide-item
                                    v-for="image in getterCurrentMLTerminalImages" :key="image"
                            >
                                <v-card :width="maxified.includes(image) ? 510 : 160" :height="maxified.includes(image) ? 510 : 160">
                                <v-img contain
                                        :height="maxified.includes(image) ? 500 : 150"
                                        :src="baseUrl+image+`?time=`+currentTimeString"
                                lazy-src="../../assets/s_logo.png">
                                <v-container
                                        align="end">
                                <v-btn icon color="primary">
                                <v-icon @click="togglesize(image)">mdi-details</v-icon></v-btn></v-container>
                                </v-img>
                                </v-card>
                            </v-slide-item>
                        </v-slide-group>
                </v-sheet>
          </v-card-text>
        <v-card-text>
            <v-textarea label="Console" readonly v-model="getterCurrentMLTerminalOutput"></v-textarea>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text>
            <v-textarea label="Predictions" readonly v-model="getterCurrentMLTerminalPredictions"></v-textarea>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-text>
            <v-textarea label="Performances" readonly v-model="getterCurrentMLTerminalPerformances"></v-textarea>
        </v-card-text>

        <v-divider></v-divider>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-select
                  class="ma-2"
               v-if="containsCodeFile"
                v-model="ml_dataset"
                :items="getterDataSetModels"
               item-text="title"
               item-value="id"
               return-object
                 label="ML Dataset"
                outlined
                ></v-select>
          <v-text-field v-model="test_iterations" label="Iterations" v-if="containsCodeFile" class="ma-2"></v-text-field>
          <v-btn
                  v-if="containsCodeFile"
            color="green"
            text
            @click="startscript"
          > <v-icon>
            mdi-play-circle-outline
          </v-icon>
            Test Model
          </v-btn>

          <v-btn
                  class="ma-2"
            color="primary"
            text
            @click="exitDialog"
          >
            Close
          </v-btn>


        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
    import {mapGetters, mapState} from "vuex";
  import axios from "axios";

  export default {

    props: {
          id: String,
           title: String,
           status: String,
           type:String,
           version: String,
           is_active: Boolean,
           files: Array,
      },
    data () {
      return {
        socket:null,
        dialog: false,
        teststarted:false,
        ml_dataset:null,
        test_iterations:0,
        console_out:"",
        update: null,
        updateFileObj:null,
          ml_model_result: null,
          maxified:[],
      }
    },
    computed: {
        ...mapGetters('mlmodel', ['getterDataSetModels', 'getterCurrentMLTerminalOutput', 'getterCurrentMLTerminalPredictions','getterCurrentMLTerminalPerformances','isWebSocketOpen','getterCurrentMLTerminalImages']),
        ...mapState({baseUrl: state => state.endpoints.baseUrl.substr(0,state.endpoints.baseUrl.length-1)}),
      containsCodeFile()  {
          return this.files.map(file => file.file.includes('ml_code.py')).some(x=> x==true)
      },
        currentTimeString () {
          return Date.now().toString()
        },
        isImageMaxified:
            {
              get:  function(image) {
                    if (this.maxified.includes(image)) {
                        return true
                    } else {
                        return false
                    }
                },
                set: function(image){
                  if (this.maxified.includes(image)) {
                            this.maxified.pop(image)
                    } else {
                        this.maxified.push(image)
                    }
                }
        }
    },
    mounted() {
      this.$store.commit('mlmodel/setCurrentMLTerminalID',this.id)
    },
    methods: {
        togglesize: function(image){
             if (this.maxified.includes(image)) {
                this.maxified.pop(image)
            } else {
                this.maxified.push(image)
            }

        },
        startscript: function() {
          // executes the remote script
          this.$store.commit('mlmodel/setCurrentMLTerminalID',this.id)
          this.teststarted=true;
          if (!this.isWebSocketOpen) {
            this.$connect(this.$store.state.endpoints.mlmodel_webSocket + this.id + '/', {
              format: 'json',
              store: this.$store
            })
            this.$store.commit('mlmodel/setToOpenWebSockets',this.id)

          }
          this.$store.dispatch('mlmodel/testMLModel',{'id':this.id,'dataset':this.ml_dataset ? this.ml_dataset.id : null,'number_imgs':this.test_iterations})

        },


     updateFile: function() {
          let target = this.$store.state.endpoints.baseUrl+process.env["VUE_APP_MLMODEL"]+this.id+'/'
          const tempform = new FormData();
          tempform.append("files", this.updateFileObj, this.updateFileObj.name)
          const config = {
                  url: target,
                method: 'PATCH',
                  headers: {
                      'authorization': `Bearer ${this.$store.state.token}`,
                      'Content-Type': 'multipart/form-data'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                data: tempform

              }
                  axios(config)
                      .then((response) => {
                      console.log(response)
                  }).catch((e) => {
                      console.log(e)
                  }).finally(()=> this.update=null)

      },

      downloadFile: function(url,label) {
          axios.get(url, { responseType: 'blob' })
            .then(response => {
              const blob = new Blob([response.data], { type: 'text' })
              const link = document.createElement('a')
              link.href = URL.createObjectURL(blob)
              link.download = label
              link.click()
              URL.revokeObjectURL(link.href)
              }).catch(console.error)
      },
      exitDialog: function () {
          this.teststarted=false
          this.$store.commit('mlmodel/setCurrentMLTerminalID','')
        this.dialog=false
      },
      dePathFile: function (file) {
             return file.split('/').slice(-1)[0]
           },
      isCodeFile: function (file) {
          var df = this.dePathFile(file)
         if (df.split('.').slice(-1)[0]=='py') {
           return true
         } else {
           return false
         }
      },
    }
  }
</script>
