<template>
    <v-dialog v-model="dialog">
        <v-card class="ma-2">
            <v-card-title>
                Kamera
                <v-spacer>
                </v-spacer>
                <v-btn icon @click="cameraInformationSwitch=!cameraInformationSwitch">
                    <v-icon large v-if="cameraInformationSwitch">mdi-information</v-icon>
                    <v-icon large v-else>mdi-information-outline</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-subtitle v-if="owner">
                {{ getParticipantFullname(owner) }}
            </v-card-subtitle>
            <v-card-text>
                <v-row dense>
                    <v-col v-for="(item,i) in camera_program"
                           :key="i">
                        <v-card max-width="200" max-height="250" class="pa-1">

                            <v-card-subtitle v-if="cameraInformationSwitch">
                                {{ camera_modes[item].instruction }}
                            </v-card-subtitle>
                            <v-img :height="cameraInformationSwitch ? 130 : 190"
                                   :src="getterCameraPictures[i] ? getterCameraPictures[i].display_img ? getterCameraPictures[i].display_img : camera_modes[item].overlay_img : camera_modes[item].overlay_img"></v-img>
                            <v-overlay opacity="0.1"
                                       v-if="(!getterCameraPictures[i]) || (getterCameraPictures[i] ? (!getterCameraPictures[i].display_img) : null)"
                                       absolute>
                                <v-row justify="center">
                                    <v-btn class="ma-2" color="success" outlined icon large @click="setCurrentCameraPicture(i)">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </v-row>
                            </v-overlay>
                            <v-overlay v-if="(getterCameraPictures[i] ? (getterCameraPictures[i].display_img) : null)"
                                       opacity="0.1" absolute>
                                <v-img :height="cameraInformationSwitch ? 130 : 190"
                                       :src="camera_modes[item].overlay_img" contain></v-img>
                                <v-overlay opacity="0" absolute>
                                    <v-btn v-if="((getterCameraPictures[i].status==='pending') || (getterCameraPictures[i].status==='uploaderror'))"
                                           color="error" outlined icon large @click="removeItem(i)">
                                        <v-icon>mdi-trash-can-outline
                                        </v-icon>
                                    </v-btn>
                                    <v-icon color="primary" v-else>mdi-cloud-upload</v-icon>
                                    <v-progress-circular v-if="getterCameraPictures[i].status==='uploading'"
                                                         indeterminate></v-progress-circular>
                                    <v-icon color="success" v-if="getterCameraPictures[i].status==='uploaded'">
                                        mdi-check
                                    </v-icon>
                                    <v-icon color="error" v-if="getterCameraPictures[i].status==='uploaderror'">
                                        mdi-alert-circle
                                    </v-icon>
                                </v-overlay>

                            </v-overlay>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-row dense>
                <v-btn class="ma-2 pa-2" color="primary" outlined @click="uploadImages" :loading="uploading">
                    <v-icon color="primary" class="mr-3">mdi-cloud-upload</v-icon>
                    {{ isMobile ? '' : 'Bilder hochladen' }}</v-btn>
                <v-spacer></v-spacer>
                <v-btn class="ma-2" color="error" outlined @click="clearAllCameraPictures">
                    <v-icon color="error" class="mr-3">mdi-trash-can-outline</v-icon>
                    {{ isMobile ? '' : 'Alle löschen' }}</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="anyUploaded" class="ma-2" color="success" outlined @click="closeDialog" :disabled="uploading">OK</v-btn>
                <v-btn v-if="!anyUploaded" class="ma-2" color="error" outlined @click="closeDialog" :disabled="uploading">
                    <v-icon color="error" class="mr-3">mdi-close-circle-outline</v-icon>
                    {{ isMobile ? '' : 'Abbruch' }}</v-btn>
                </v-row>
            </v-card-actions>
        </v-card>

        <EasyCamera v-show="getterCurrentCameraPicture!==null"
                    ref="vuecamera"
                    v-model="picture"
                    :overlayMask="current_overlay"
                    output="blob"
                    fullscreen
                    mustApprove
                    @close="closeDialog"
        ></EasyCamera>

    </v-dialog>
</template>

<script>
    import {mapGetters, mapMutations} from "vuex";

    import camera_parameters from './camera_parameters.json'
    import EasyCamera from 'easy-vue-camera';
    import pLimit from "p-limit";
    import * as axios from "axios";

    export default {
        name: 'Veasycampanel',
        components: {EasyCamera},
        props: ['owner','program'],
        data() {
            return {
                cameraInformationSwitch: false,
                showSnackBar: null,
                currentInstructionIndex:null,
                uploading: false,
                dialog: true,
                slide_img: null,
                picture: null,
                successfully_uploaded:[],
            }
        },
        computed: {
            ...mapGetters('imagecenter', ['getterCameraPictures', 'getterCurrentCameraPicture']),
            ...mapGetters('caseroom',['getParticipantFullname']),
            ...mapGetters(['isMobile']),
            camera_program() {
                return this.program ? camera_parameters.camera_programs[this.program] : camera_parameters.camera_programs['SSM']
            },

            camera_modes() {
                return camera_parameters.camera_modes
            },

            current_overlay() {
                var curProgram = this.camera_program[this.getterCurrentCameraPicture]
                return this.camera_modes[curProgram] ? this.camera_modes[curProgram].overlay_img : null
            },

            current_instruction() {
                if (this.currentInstructionIndex!==null) {
                    var curProgram = this.camera_program[this.currentInstructionIndex]
                return this.camera_modes[curProgram] ? this.camera_modes[curProgram].instruction : null
                } else return null
            },

            anyUploaded() {
                return this.getterCameraPictures.some((x) => x.status==='uploaded')
            },

        },
        watch: {
            picture: function (val) {
                if (val) {
                    const reader = new FileReader();
                    let display_img;
                    var curProgram = this.camera_program[this.getterCurrentCameraPicture]
                    var this1 = this
                    reader.addEventListener("load", function () {
                        // convert image file to base64 string
                        display_img = reader.result

                        this1.$store.commit('imagecenter/setCameraPicture', {
                            status: 'pending',
                            type: this1.camera_modes[curProgram].type,
                            pic: this1.picture,
                            display_img: display_img
                        })
                        this1.setCurrentCameraPicture(null)
                        this1.picture = null
                    }, false);
                    reader.readAsDataURL(val);
                }
            },
            getterCurrentCameraPicture: function (oldVal, newVal) {
                if ((oldVal === null) && (newVal)) {
                    this.$refs['vuecamera'].start()
                }
            }
        },

        methods: {
            ...mapMutations('imagecenter', ['setCurrentCameraPicture', 'clearAllCameraPictures']),
            removeItem(index) {
                this.setCurrentCameraPicture(index)
                this.$store.commit('imagecenter/setCameraPicture', {pic: this.picture})
                this.setCurrentCameraPicture(null)
            },

            uploadImages() {
                if ((this.program==='dr-id') ||(this.program==='id')) {
                    this.submitProofImages()
                } else this.submitPictures()
            },

            submitPictures() {
                this.uploading = true
                const limit = pLimit(1);
                const input = []
                this.getterCameraPictures.forEach((x) => {
                    input.push(limit(() => {
                        if (x.status === 'pending') {
                            var fd = new FormData()
                            x.status = 'uploading'
                            fd.append('type', x.type)
                            fd.append('title', '&owner: &created')
                            fd.append('img', x.pic, 'canvasimg.png')
                            if (this.owner) {
                                fd.append("owner", this.owner);
                            }
                            this.$store.dispatch('imagecenter/submitNewSSM', fd)
                                .then(() => x.status = 'uploaded')
                                .catch((e) => {
                                    x.status = 'uploaderror'
                                    console.log(e)
                                })
                        }
                    }))
                });
                input.push(limit(() => {
                    this.uploading = false
                    this.$emit('VCameraDone')
                }));
                (async () => {
                    await Promise.all(input);
                })();
            },

            submitProofImages() {
                this.uploading = true
                const limit = pLimit(1);
                const input = []
                this.getterCameraPictures.forEach((x) => {
                    input.push(limit(() => {
                        if (x.status === 'pending') {
                            var fd = new FormData()
                            var filename = this.owner + '-' + x.type + '.png'
                            fd.append('proof_type', x.type);
                            fd.append('img', x.pic, filename)
                            var config = {
                                url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                                method: "post",
                                headers: {
                                    authorization: `Bearer ${this.$store.state.token}`,
                                    'Content-Type': 'multipart/form-data'
                                },
                                xhrFields: {
                                    withCredentials: true
                                },
                                data: fd,
                            };
                            axios(config).then((response) => {
                                this.successfully_uploaded.push(response.data)
                                x.status = 'uploaded'
                            })
                                .catch((e) => {
                                    x.status = 'uploaderror'
                                    console.log(e)
                                })
                        }
                    }));
                })
                input.push(limit(() => {
                    this.uploading = false
                    this.$emit('VCameraDone', {uploaded: this.successfully_uploaded})
                }));
                (async () => {
                    await Promise.all(input);
                })();
            },
            closeDialog() {
                this.$emit('CamPanelClosed')
                this.setCurrentCameraPicture(null)
                this.clearAllCameraPictures()
                this.dialog = false
                this.$refs['vuecamera'].stop()
            },

        },

        mounted() {
            this.clearAllCameraPictures()
        },
    };
</script>
