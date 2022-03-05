<template>
    <v-container>
    <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" v-on:vdropzone-file-added="fileAdded"></vue-dropzone>
             <v-btn
                  class="mx-2"
                  color="primary"
                    @click="postNewEntry"
                >
          Nachweise hochladen
                  <v-icon>
                mdi-upload
            </v-icon>

              </v-btn>
        </v-container>
</template>

<script>
    import * as axios from "axios";
    import vue2Dropzone from "vue2-dropzone";
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'
    import component_tracer from "@/mixins/component_tracer";

    export default {
        name:'ProofUploadDialog2',
        mixins: [component_tracer],
        components: {
            vueDropzone: vue2Dropzone
        },
        props: {
            proof_type: String,
        },
        data () {
            return {
                successfully_uploaded:[],
                formDataArray: [],
                    loader: null,
                    loading: false,
                dropzoneOptions: {
                    url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                    method: "post",
                    thumbnailWidth: 150,
                    maxFilesize: 10,
                    acceptedFiles: 'image/png, image/jpeg, image/bmp',
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                }
            }
        },
        methods: {

            fileAdded(file) {
                const tempform = new FormData();
                tempform.append('proof_type', this.proof_type);
                tempform.append('img', file)
                this.formDataArray.push(tempform)
            },
            postNewEntry: async function () {
                let count = 0

                await new Promise((resolve) => {
                    this.formDataArray.forEach(formData => {
                        const axiosInstance = axios.create(this.$store.state.axiosBase)
                        axiosInstance({
                            url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                            method: "post",
                            headers: {
                                authorization: `Bearer ${this.$store.state.token}`,
                                'Content-Type': 'multipart/form-data'
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                            data: formData,
                            params: {}
                        }).then((response) => {
                            this.successfully_uploaded.push(response.data)
                        }).catch((e) => {
                            console.log(e)
                        }).finally(() => {
                            // most important is here
                            count += 1
                            if (count == this.formDataArray.length) {
                                resolve()
                            }
                        })
                    })
                }).then(()=> {
                        this.$refs.myVueDropzone.removeAllFiles()
                        this.formDataArray = [];
                        this.$emit('updateProofs', {uploaded: this.successfully_uploaded})
                    })
                    },

                },
            };
</script>
