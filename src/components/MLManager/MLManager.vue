<template>
    <div class="MLManager">
      <v-container>
        <v-row>
            <v-col>
        <v-data-table
              :headers="headers_mlmodels"
              :items="getterMLModels"
              item-key="id"
              class="elevation-1"
              single-expand
                :expanded.sync="expanded"
              show-expand
              :search="search"
            >
              <template v-slot:top>
                <v-text-field
                  v-model="search"
                  label="Search in ML models"
                  class="mx-4"
                ></v-text-field>
              </template>

            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                 <v-sheet
                        class="mx-auto"
                        elevation="8"

                      >
                     <MLItem
                    :id="item.id"
                    :title="item.title"
                    :status="item.status"
                    :type="item.type"
                    :version="item.version"
                    :is_active="item.is_active"
                    :files="item.files"
                    :created="item.created"
                    @mlmodeldeleted="updateManager"
                    @mlmodelupdated="updateManager"
                    >

                    </MLItem>


                      </v-sheet>
              </td>
            </template>
            <template v-slot:item.is_active="{ item }">
                          <v-chip
                            :color="getColor(item.is_active)"
                            dark
                          >{{ item.is_active }}
                          </v-chip>
            </template>
    </v-data-table>

</v-col>
</v-row>



          <v-row>
            <v-col cols="12">
        <v-form @submit.prevent="triggerSend" ref="MLForm" v-model="valid"
                                    lazy-validation>
          <v-card>
          <v-card-title>ML Model Manager: Create New Model</v-card-title>
              <v-card-text>
              <v-text-field v-model="mltitle" label="Name of ML Model" :rules="[rules.required]"
                          required></v-text-field>
                  <v-select
                          v-model="mltype"
                :items="getterMLModelTypes"
                 label="ML Model Type"
                outlined

                ></v-select>
                  <v-text-field v-model="mlversion" label="Model Version"></v-text-field>
          <vue-dropzone ref="mlmodelVueDropzone" id="dropzone"
                        :options="dropzoneOptions"
                        @vdropzone-sending="sendingEvent"
                        @vdropzone-upload-progress="uploadProgress"
                        @vdropzone-success-multiple="onUploadSuccess"
          ></vue-dropzone>
              </v-card-text>
              <v-card-text v-if="uploading">Fortschritt für {{ uploadfile }}: {{ formatNumber(uploadbytes) }} Bytes
              <v-progress-linear :value="uploadprogresspercent"></v-progress-linear>
                  </v-card-text>
                  <v-card-actions>
            <v-btn type="submit">Hochladen</v-btn>
                  </v-card-actions>
            </v-card>
      </v-form>
                </v-col>
</v-row>

      </v-container>
    </div>
</template>


<script>
    import vue2Dropzone from "vue2-dropzone";
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'
    import {mapGetters} from "vuex";
    import MLItem from "@/components/MLManager/MLItem";

    export default {
        components: {
            vueDropzone: vue2Dropzone,
            MLItem,
        },
        props: {
        },
        data() {
            return {
                valid:false,
                mltitle:'',
                mltype:'dummy',
                mlversion:'0.0.0',
                uploading: false,
                uploadprogresspercent:0,
                uploadfile:null,
                uploadbytes:0,
                dropzoneOptions: {
                    url: process.env.VUE_APP_BACKEND_URL +"mlmodel/",
                    method: "POST",
                    thumbnailWidth: 150,
                    maxFilesize: 10000,
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                    headers: {
                        'Authorization': `Bearer ${this.$store.state.token}`,
                         "Cache-Control": "",
                      },
                    withCredentials: true,
                    uploadMultiple: true,
                    parallelUploads: 10,
                    timeout: 600000,

                },
                rules: {
                    required: value => !!value || "Erforderlich.",
                },
                expanded: [],
                search: '',

            }
    },
        computed: {
            ...mapGetters("mlmodel",['getterMLModels','getterMLModelTypes']),
               headers_mlmodels () {
                return [
                  {
                    text: 'Title',
                    align: 'start',
                    sortable: true,
                      value: 'title'
                  },
                  {
                    text: 'Type',
                    sortable: true,
                    value: 'type',
                  },
                    { text: 'Version', value: 'version' ,sortable: true},
                  { text: 'Is Active', value: 'is_active',sortable: true },
                  {
                    text: 'Name',
                    sortable: true,
                      value: 'owner_fullname'
                  },

                ]
              },

        },
        mounted() {
            this.$store.dispatch('mlmodel/getMLModelTypes');
          this.updateManager();
        },
        methods: {
            updateManager() {
                this.$store.dispatch('mlmodel/getMLModels')
            },
            resetManager() {
              this.$refs.mlmodelVueDropzone.removeAllFiles()
                this.$refs.MLForm.reset()
                this.mltitle=''
                this.mltype=null
                this.mlversion='0.0.0'
                this.uploading= false
                this.uploadprogresspercent=0
                this.uploadfile=null
                this.uploadbytes=0
            },
            onUploadSuccess() {
                this.updateManager()
                this.resetManager()
            },
            triggerSend() {
                if (this.$refs.MLForm.validate()) {
                    this.$refs.mlmodelVueDropzone.processQueue();
                }
             },
            sendingEvent(file, xhr, formData) {
              formData.append("title", this.mltitle);
              formData.append("type", this.mltype);
              formData.append("version", this.mlversion);
            },
            // function where we get the upload progress
                uploadProgress(file, progress, bytesSent) {
                    this.uploading=true
                    this.uploadprogresspercent=progress
                    this.uploadfile=file
                    this.uploadbytes=bytesSent
                },
            formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            },
            getColor (status) {
                if (status) return 'green'
                else return 'red'
              },
        }

    };
</script>
