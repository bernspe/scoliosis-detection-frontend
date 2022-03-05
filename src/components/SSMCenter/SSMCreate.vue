<template>

            <v-card class="mx-auto my-12"
    width="300"
    max-width="374">
                <v-form @submit.prevent="triggerSend"
                ref="createForm"
                v-model="valid"
                lazy-validation>
            <v-card-title>
                <span class="headline">Neue Bilder hochladen</span>
            </v-card-title>
            <v-card-text>
                <v-container>

                    <v-row>
                        <v-text-field
                                v-model="ssmtitle"
                          label="Titel: "
                          required
                                :rules="TitleRules"
                        ></v-text-field>
                    </v-row>

                    <v-row>
                        <vue-dropzone ref="ssmVueDropzone" id="dropzone"
                        :options="dropzoneOptions"
                        @vdropzone-sending="sendingEvent"
                        @vdropzone-success="onUploadSuccess"
          ></vue-dropzone>
                    </v-row>
                </v-container>
            </v-card-text>

                <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="resetForm"
          >
            Abbrechen
          </v-btn>


          <v-btn
            color="blue darken-1"
            text
                  type="submit"
          >
            Hochladen
          </v-btn>
        </v-card-actions>
                </v-form>
        </v-card>

</template>

<script>

    import vue2Dropzone from "vue2-dropzone";
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'

    export default {
        components: {vueDropzone: vue2Dropzone,},
        props: {
            owner: String,
            title: String,
        },
        data () {
            return {

                valid: false,
                ssmtitle_text: '',
                TitleRules: [v => !!v || "Erforderlich."],
                dropzoneOptions: {
                    url: process.env.VUE_APP_BACKEND_URL + process.env["VUE_APP_SPLINEAPP_SUFFIX"],
                    method: "POST",
                    thumbnailWidth: 150,
                    maxFilesize: 10,
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                    headers: {
                        'Authorization': `Bearer ${this.$store.state.token}`,
                        "Cache-Control": "",
                    },
                    withCredentials: true,
                    paramName: 'img',
                },

            }
        },
        computed: {
          ssmtitle: {
              get() {
                  if (this.ssmtitle_text.length === 0) return this.title
                  else return this.ssmtitle_text
              },
              set(val) {
                  this.ssmtitle_text = val
              }
          }
        },
        methods: {
            resetForm() {
                this.$refs.ssmVueDropzone.removeAllFiles()
                this.$refs.createForm.reset()
                this.ssmtitle= ''

                this.$emit('SSMCreationAborted')

            },

            onUploadSuccess() {
                this.$emit('ssmcreated')
                this.resetForm()
            },
            triggerSend() {
                if (this.$refs.createForm.validate()) {
                    this.$refs.ssmVueDropzone.processQueue();
                }

             },
            sendingEvent(file, xhr, formData) {
              formData.append("title", this.ssmtitle);
                if (this.owner){
                    formData.append("owner", this.owner);
                }
            },


        },
    };
</script>
