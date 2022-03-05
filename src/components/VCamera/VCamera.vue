<template>
    <v-card :max-width="500">
        <v-card-text class="pa-2">
        <div class="video-wrapper">
            <video :id="videoElementId" autoplay playsinline></video>
            <canvas :id="canvasElementId" v-show="picture"></canvas>

           <v-overlay
              absolute
              z-index="0"
           >
               <v-img :src="overlay_img" contain max-height="200"></v-img>
               <div class="balance-container" :style="cssProps" v-if="!((proof_type) || (program==='avatar'))">
                        <div class="dot-1" :style="cssProps"></div>
                </div>

           </v-overlay>
                    <v-speed-dial
                      v-model="camera_speeddial"
                      bottom right
                      absolute
                      direction="top"
                      open-on-hover
                      transition="slide-y-reverse-transition"

                    >
                      <template v-slot:activator>
                        <v-btn
                          v-model="camera_speeddial"
                          color="blue darken-2"
                          dark
                          fab
                        >
                          <v-icon v-if="camera_speeddial">
                            mdi-video-box-off
                          </v-icon>
                          <v-icon v-else>
                            mdi-video-box
                          </v-icon>
                        </v-btn>
                      </template>
                        <v-btn fab dark small color="success" @click="play" v-show="!video_stream.active || video.paused || is_halted ||showPlayButton">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn fab dark small color="success" @click="halt" v-show="video_stream.active && (!video.paused) && !is_halted">
                            <v-icon>mdi-pause</v-icon>
                        </v-btn>
                      <v-btn
                        fab
                        dark
                        small
                        color="success"
                        @click="snapAndContinue"
                      >
                        <v-icon>mdi-camera-plus-outline</v-icon>
                      </v-btn>
                      <v-btn
                        fab
                        dark
                        small
                        color="primary"
                        @click="switchCamera"
                      >
                        <v-icon>mdi-camera-flip-outline</v-icon>
                      </v-btn>
                      <v-btn
                        fab
                        dark
                        small
                        color="red"
                        @click="cancel"
                      >
                        <v-icon>mdi-cancel</v-icon>
                      </v-btn>
                        <v-btn
                        fab
                        dark
                        small
                        color="success"
                        :disabled="picture_array.length<required_pictures"
                        @click="submit"
                      >
                        <v-icon>mdi-check</v-icon>
                      </v-btn>
                    </v-speed-dial>
        </div>

        </v-card-text>
        <v-divider>
        </v-divider>
        <v-card-subtitle>
            {{ camera_mode.instruction }}
        </v-card-subtitle>
        <v-card-text v-if="!((proof_type) || (program==='avatar'))">
            <p> Angle: {{ angle }}</p>
            <p>A: {{ gyroscopeData.alpha }}, B: {{ gyroscopeData.beta }}, C: {{ gyroscopeData.gamma }}</p>
            <p>Orientation type: {{ screen_type }}, Angle: {{ screen_orientation }}</p>
        </v-card-text>

        <v-card-text>
            <v-slide-group show-arrows v-model="slide_img">
                <v-slide-item
                  v-for="(item,i) in picture_array"
                  :key="i"
                  v-slot="{ active, toggle }"
                >
                    <v-card max-width="150" max-height="150" class="pa-1" @click="toggle">

                        <v-img :src="item.display_img" contain></v-img>

                            <v-scale-transition group>
                          <v-icon
                            v-if="active"
                            color="white"
                            size="20"
                            :key="1"
                          >mdi-close-circle-outline</v-icon>
                              <v-icon
                            v-if="active && !item.uploaded"
                            color="red"
                            size="20"
                            @click="removeItem"
                            :key="2"
                          >mdi-trash-can-outline</v-icon>
                        </v-scale-transition>
                        </v-card>
                </v-slide-item>
              </v-slide-group>
        </v-card-text>
        <v-card-actions>
            <v-row dense>
            <v-col>
                <v-btn class="ma-2" large icon color="success" @click="snapAndContinue"><v-icon>mdi-camera-plus-outline</v-icon></v-btn>
            </v-col>
            <v-col>
                <v-btn class="ma-2" large icon color="primary" @click="switchCamera"><v-icon>mdi-camera-flip-outline</v-icon></v-btn>
            </v-col>
            <v-col>
                <v-btn class="ma-2" large icon color="red" @click="resetData"><v-icon>mdi-close-circle-multiple-outline</v-icon></v-btn>
            </v-col>
                <v-spacer></v-spacer>
                <v-col>
            <v-badge color="green" :content="`${picture_array.length}/${required_pictures}`" overlap>
            <v-btn :loading="uploading" :disabled="picture_array.length<required_pictures" class="ma-2" color="primary" text @click="submit">Fertig</v-btn>
                </v-badge>
            <v-btn class="ma-2" color="error" text @click="cancel">Abbruch</v-btn>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    import {v4 as uuid4} from 'uuid';
    import Camera from 'easy-js-camera';
    import pLimit from "p-limit";
    import camera_parameters from './camera_parameters.json'
    import * as axios from "axios";
    import Vue from 'vue'
    import component_tracer from "@/mixins/component_tracer";
    require('@/plugins/fulltilt.js')

    export default {
    data() {
        return {
            camera: null,
            canvasElementId: `canvas-${uuid4().replace(/-/g, '')}`,
            canvas: null,
            picture: null,
            halt_picture:null,
            picture_array:[],
            switching: false,
            video: null,
            videoElementId: `video-${uuid4().replace(/-/g, '')}`,
            visibleMask: false,
            gyroscopeData: {},
            deviceOrientation:null,
            successfully_uploaded:[],
            slide_img:null,
            uploading:false,
            camera_speeddial_val: false,
            showPlayButton: false,
        }
    },
        asyncComputed: {
            video_stream: {
                get() {
                    var this1=this
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (this1.video)
                                if (this1.video.srcObject) {
                                     resolve(this1.video.srcObject)
                                }
                            else
                                reject()
                        }, 1000)
                    })
                },
                default: {active: false, getTracks: () => []}
            }
        },

    computed: {
        /*
        gyroscopeData() {
            return this.deviceOrientation ? this.deviceOrientation.getScreenAdjustedEuler() : {alpha:0,beta:0,gamma:0}
        },
        */
        screen_orientation() {
          return window.screen.orientation.angle
        },
        screen_type() {
          return window.screen.orientation.type
        },
        overlay_img() {
            //this is just for cache-breaking - so every user gets the newest overlays
            return this.camera_mode.overlay_img+'?u='+this.owner
        },
        is_halted() {
            if(this.camera) {
                return this.camera.videoElement.srcObject.getTracks().filter(t => t.enabled).length===0;
            } else return false
        },

        camera_speeddial: {
          get() {
              return this.camera_speeddial_val
          },
            set(val) {
              this.camera_speeddial_val=val
            }
        },
        camera_program() {
          return this.program ? camera_parameters.camera_programs[this.program] : camera_parameters.camera_programs['SSM']
        },

        camera_mode() {
            var l = this.picture_array.length
            var lmax = this.camera_program.length-1
          return camera_parameters.camera_modes[this.camera_program[l <= lmax ? l : lmax]]
        },
        current_mode() {
           return this.camera_mode.type
        },
        required_pictures() {
            return this.camera_program.length
        },
        angle() {
            /*
            const b = this.gyroscopeData.beta
            return b > 45 ? b-90 : b */
            var x = this.gyroscopeData.beta;  // In degree in the range [-180,180], x, 'front to back'
            var y = this.gyroscopeData.gamma; // In degree in the range [-90,90], y, 'left to right'
            //var z = this.gyroscopeData.alpha;
            var rad = Math.atan2(y, x);
            var deg = rad * (180 / Math.PI);
            var screenOrientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
              // 90, -90, or 0
            var angle_orient = screenOrientation.angle || window.orientation || 0;
            deg = deg + angle_orient;
            return deg
        },
      cssProps() {
          return {
            '--bubble-location': this.angle+45+"%", // define the left margin of the centered bubble (hence the 45 = -width //2 + 50)
            '--balance-color': (this.angle >= 5 || this.angle <= -5) ? "red" : "green",
              '--balance-angle': "rotate("+this.angle/5+"deg)",
              '--bubble-gradient': this.bubbleGradient
          }
        },
        bubbleGradient() {
           if (this.angle <= 5 && this.angle >= -5) {
               return "radial-gradient(green 5%, black 50%)"
               //return "radial-gradient(ellipse at center,  rgba(255,255,255,0.5) 0%,rgba(255,255,255,0) 70%)";
           } else {
               return this.angle >=5 ? "linear-gradient(to right, rgba(255,0,0,0), rgba(255,0,0,1))" : "linear-gradient(to left, rgba(255,0,0,0), rgba(255,0,0,1))"
                //return "radial-gradient(ellipse at center,  rgba(255,255,255,0.5) 0%,rgba(255,255,255,0) 70%)";
           }
        },
        uploadProgress() {
            const l=this.picture_array.length
            const a = l>0 ? this.picture_array.filter(x=>x.uploaded) : 0
            return a.length/l*100
        },
    },
    methods: {

        removeItem() {
            this.picture_array.splice(this.slide_img,1)
        },
        submit() {
          if (this.proof_type) {
              this.submitProofImages()
          } else {
              if (this.program==='avatar') this.submitAvatarImage()
              else this.submitPictures()
          }
        },
        submitPictures() {
            this.uploading=true
            const limit = pLimit(1);
            const input = []
            this.picture_array.forEach((x)=> {
                input.push(limit(() => {
                            if (!x.uploaded) {
                                var fd = new FormData()
                                fd.append('type',x.type)
                                fd.append('title','&owner: &created')
                                fd.append('img',x.image,'canvasimg.png')
                                if (this.owner){
                                        fd.append("owner", this.owner);
                                }
                                this.$store.dispatch('imagecenter/submitNewSSM',fd)
                                .then(() => x.uploaded=true)
                                .catch((e) => console.log(e))
                            }
                        }))
            });
            input.push(limit(() => {
                this.uploading=false
                this.stop()
                this.$emit('VCameraDone')
            }));
            (async () => {  await Promise.all(input);})();
        },

        submitProofImages() {
            this.uploading=true
            const limit = pLimit(1);
            const input = []
            this.picture_array.forEach((x)=> {
                input.push(limit(() => {
                    if (!x.uploaded) {
                        var fd = new FormData()
                        var filename=this.owner+'-'+x.type+'.png'
                        fd.append('proof_type', x.type);
                        fd.append('img', x.image, filename)
                        var config={
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
                            x.uploaded = true
                        })
                                .catch((e) => console.log(e))
                    }
                }));
            })
            input.push(limit(() => {
                this.uploading=false
                this.stop()
                this.$emit('VCameraDone',{uploaded: this.successfully_uploaded})
            }));
            (async () => {  await Promise.all(input);})();
        },

        submitAvatarImage() {
            this.uploading=true
            const limit = pLimit(1);
            const input = []
            this.picture_array.forEach((x)=> {
                input.push(limit(() => {
                    if (!x.uploaded) {
                        var fd = new FormData()
                        var owner=this.owner
                        var filename=owner+'_avatar.png'
                        fd.append('avatar', x.image, filename)
                        var config={
                            url: process.env.VUE_APP_BACKEND_URL +"users/"+owner+'/updateAvatar/',
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
                            x.uploaded = true
                        })
                                .catch((e) => console.log(e))
                    }
                }));
            })
            input.push(limit(() => {
                this.uploading=false
                this.stop()
                this.$emit('VCameraDone',{uploaded: this.successfully_uploaded})
            }));
            (async () => {  await Promise.all(input);})();
        },


        cancel() {
                this.stop()
                this.$emit('VCameraDone')

        },
        blob2DataUrl(blob, index) {
          const reader = new FileReader();
          var this1=this
          reader.addEventListener("load", function () {
                // convert image file to base64 string
                Vue.set(this1.picture_array[index],'display_img', reader.result);
                }, false);
            if (blob) {
                    reader.readAsDataURL(blob);
            }
        },


        snapAndContinue() {
           this.snapAsBlob().then((pic) => this.picture=pic)
           //document.getElementById(this.videoElementId).play();
        },
        snapAsBlob() {
            if(!this.camera) {
                console.error('Camera not found to take a picture');
                return;
            }
            return new Promise(resolve => {
                this.camera.snapAsBlob()
                    .then(picture => {
                        resolve(picture);
                    });
            });
        },
        snapAsDataUrl() {
            if(!this.camera) {
                console.error('Camera not found to take a picture');
                return;
            }
            this.picture = this.camera.snapAsDataUrl();
            return this.picture;
        },
        start() {

            if(this.camera) {
                this.picture = null;
                this.camera.videoElement.srcObject.getTracks().forEach(t => {
                    console.log('Enabling Track: ',t)
                    t.enabled = true
                })
                /*
                this.$emit('loading', true);
                this.camera.start()
                    .finally(() => this.$emit('loading', false)); */
                return;
            }
            this.video = document.getElementById(this.videoElementId);
            this.canvas = document.getElementById(this.canvasElementId);
            return new Promise(resolve => {
                Camera.tryInvokePermission(this.video, this.canvas)
                    .then(camera => {
                        this.camera = camera
                        resolve(camera);
                    });
            });
        },
        stop() {
            if(this.camera) {
                //this.camera.videoElement.srcObject.getTracks().forEach((x) => x.stop())
                this.camera.videoElement.srcObject.getTracks().forEach(t => {
                    console.log('Disabling Track ',t)
                    t.enabled = false
                })
            }
            //this.camera.videoElement.srcObject = null;
            //this.camera.stop();
            //this.camera=null;
            //this.video=null;
        },
        ultimate_stop() {
           if(this.camera) {
                this.camera.videoElement.srcObject.getTracks().forEach((x) => x.stop())
            }
        },
        halt() {
            if(this.camera) {
                this.video.pause()
            }
        },
        play() {
            this.showPlayButton=false
            if(this.camera) {
                //check if device is muted
                if (this.camera.videoElement.srcObject.getTracks().filter(t => t.enabled).length===0) {
                    this.start()
                }
                console.log('Camera exists, playing')
                this.video.play()
            } else {
                console.log('Camera does not exist...')
                this.start()
                    .then(camera => {
                        if (camera) {
                            console.log('...now starting')
                            camera.start();
                            this.$emit('camerastarted', camera);
                        }
                    })
            }
        },
        switchCamera(tryAgain = false) {
            if(this.switching && !tryAgain) return;
            if(!this.camera) {
                console.error('No camera found to switch...');
                return;
            }
            this.switching = true;
            return new Promise((resolve, reject) => {
                this.camera.switch(tryAgain)
                    .then(() => {
                        this.switching = false;
                        resolve();
                    })
                    .catch(() => {
                        if(!tryAgain) {
                            this.switchCamera(true);
                        } else {
                            this.switching = false;
                            reject();
                        }
                    })
            });
        },
        toggleMask() {
            this.visibleMask = !this.visibleMask;
        },
        resetData() {
            this.picture= null
            this.halt_picture=null
            this.picture_array=[]
        },
    },
    mounted() {
        this.resetData()
        if(this.startOnMounted) {
            this.$emit('loading', true);
            this.start()
                .then(camera => {
                    if(camera) {
                        camera.start();
                        this.$emit('camerastarted',camera);
                    }
                })
                .finally(this.$emit('loading', false));
        }
        var this1=this

        window.addEventListener("deviceorientation", function(event) {
            this1.gyroscopeData={alpha: Math.round(event.alpha), beta: Math.round(event.beta), gamma: Math.round(event.gamma)}
        }, true);
/*
        var promise = new window.FULLTILT.getDeviceOrientation({ 'type': 'world' });
        promise
            .then(function(controller) {
              // Store the returned FULLTILT.DeviceOrientation object
              this1.deviceOrientation = controller;
            })
            .catch(function(message) {
              console.error(message);

              // Optionally set up fallback controls...
              // initManualControls();
            });*/
    },
    beforeDestroy() {
        this.resetData();
      this.ultimate_stop()
    },

    watch: {
      picture(newVal, oldVal) {
          if (newVal !== oldVal) {
              if (newVal) {
                  var l=this.picture_array.push({image: newVal, type: this.current_mode, uploaded: false})
                  this.blob2DataUrl(newVal,l-1)
              }
          }
      },
        cameraVisible(newVal,oldVal) {
          if (newVal && !oldVal) {
              if (this.startOnMounted) {
                  this.play()
              } else {
                  this.showPlayButton=true
              }
          }
        }

/*
        picture_array: {
          handler(newVal,oldVal) {
              console.log(newVal,oldVal)
          },
            deep:true
        }*/
    },
    name: 'VCamera',
        mixins: [component_tracer],
    props: {
        startOnMounted: Boolean,
        cameraVisible: Boolean,
        program: String,
        owner: String,
        proof_type: String,
    }
}
</script>
<style lang="scss" scoped>

.balance-container {
    margin-top: 10%;
  border: 2px solid var(--balance-color);
  border-radius: 5px;
  transform: var(--balance-angle);
}

.dot-1 {
  height: 25px;
  width: 25px;
  margin-left: var(--bubble-location);
    border: 1px solid #dfe2e5;
    background: #1b1f23;
	//box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2), inset 0px 10px 30px 5px rgba(255, 255, 255, 1);

  border-radius: 50%;
  display: inline-block;
  background-image: var(--bubble-gradient);
}



.video-wrapper {
    overflow: hidden;
    display: flex;
    align-items: center;
    position: relative;
    video {
        width: 100%;
        height: auto;
    }
    canvas {
        width: 100%;
        height: auto;
    }
    .overlay {
        position: absolute;
        left: 100%;
        transform: translateX(-50%);
        height: 100%;
        width: auto;
        display: flex;
        &.visible-overlay {
            box-shadow: 0px 0px 2000px 2000px rgba(0, 0, 0, .8);
        }
        img {
            height: auto;
        }
    }
}
</style>
