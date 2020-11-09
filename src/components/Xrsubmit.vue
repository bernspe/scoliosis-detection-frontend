<template>
        <v-card>

                <v-card-title
                  class="headline"
                  v-text="title"
                ></v-card-title>
                    <v-btn
                      color="blue-grey"
                      class="ma-2 white--text"
                      @click="postNewEntry"
                    >
                      <v-icon dark>
                        mdi-cloud-upload
                      </v-icon>
                    </v-btn>

        <v-container>
            <Xrlist v-bind:show-all="false"></Xrlist>
            <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" v-on:vdropzone-file-added="fileAdded"></vue-dropzone>
            <v-btn
                     color="blue-grey"
                      class="ma-2 white--text"
                @click="randomSamples"
                >Random Sample XRay
                <v-icon dark right>

                    mdi-radiology-box
                </v-icon>
            </v-btn>
        </v-container>
        </v-card>
</template>

<script>
    import vue2Dropzone from 'vue2-dropzone'
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'
    import * as axios from "axios";
    import Xrlist from "@/components/Xrlist";


    export default {
        components: {
            Xrlist,
            vueDropzone: vue2Dropzone
        },

        data () {
            return {
                title: 'Submit New Xray',
                formDataArray: [],
                    loader: null,
                    loading: false,
                dropzoneOptions: {
                    url: this.$store.state.endpoints.splineAppUrl,
                    method: "post",
                    thumbnailWidth: 150,
                    maxFilesize: 2.5,
                    acceptedFiles: 'image/jpeg',
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                }
            }
        },
        methods: {
            fileAdded(file) {
                const tempform = new FormData();
                //check if this was a randomly created file
                if (file.name.includes('scol_sample')) {
                    console.log('Example detected')
                    const fe_url=this.$store.state.endpoints.baseUrlFrontend+'images/';
                    const imageUrl = fe_url + file.name;
                    //fetch the image
                    axios.get(imageUrl, {responseType: "blob"})
                        .then(function (response) {
                            //convert it to file object
                            var file2 = new File([response.data], file.name,{type:"image/jpeg", lastModified:new Date()})
                            tempform.append("img",file2);
                        });

                } else {
                    tempform.append("img", file);
                }

                tempform.append('title', file.name);
                tempform.append('type', 'process_xray_cobb');
                this.formDataArray.push(tempform)
            },
            postNewEntry() {
                if (this.$store.state.isAuthenticated) {
                    console.log(this.formDataArray);
                    this.formDataArray.forEach(formData => {
                        const axiosInstance = axios.create(this.$store.state.axiosBase)
                        axiosInstance({
                            url: this.$store.state.endpoints.splineAppUrl,
                            method: "post",
                            headers: {
                                Authorization: `Token ${this.$store.state.token}`,
                                "Content-Type": "multipart/form-data"

                            },
                            data: formData,
                            params: {}
                        })
                            .then((response) => {
                                const data = response.data
                                this.$store.commit('setEntryData',
                                    {
                                        id: data.id,
                                        title: data.title,
                                        status: 'pending',
                                        img: data.img,
                                        modimg: data.modified_img,
                                        fdata: {'EndVertebrae': [], 'COBBAngles': []}
                                    });
                                this.$store.commit('appendEntryKey', {id: data.id});
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                    })
                    this.$refs.myVueDropzone.removeAllFiles()
                    this.formDataArray = [];
                }
            },
            randomSamples() {
                if (this.$store.state.isAuthenticated) {
                    var x = Math.floor((Math.random() * 10) + 1);
                    const imgfilename = 'scol_sample'+x+'.jpg';
                    const fe_url=this.$store.state.endpoints.baseUrlFrontend+'images/';
                    var mockFile = {
                        name: imgfilename,
                        size: 0,
                        type: "image/jpeg",
                        accepted: true,
                    };
                    this.$refs.myVueDropzone.manuallyAddFile(mockFile,fe_url + imgfilename);
                }
            },
        },
        created () {
                this.$store.commit('deleteEntryKeys');
            },
        beforeDestroy() {
            this.$store.commit('deleteEntryKeys');
        }
    };
</script>
