<template>
    <v-img :contain="contain"
           :height="height"
           :max-width="width"
           :src="retrieveAuthImage ? retrieveAuthImage : cachebreaker ? _src+timefragment() : _src"
           lazy-src="../assets/s_logo.png"
            @load="imageloaded">

        <template v-slot:placeholder v-if="!imgonly">
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>

        <v-container v-if="!imgonly">

            <v-row align="center" >
                <v-col align-self="start" cols="4">
                    <v-progress-circular
                      :rotate="360"
                      :size="40"
                      :width="4"
                      :value="getterNumericStatus(getterAllEntries[ssmid].status)"
                      color="teal"
                    >
                      {{ getterNumericStatus(getterAllEntries[ssmid].status) }}
                    </v-progress-circular>
                </v-col>

                <v-col align-self="end" cols="4" offset="8" v-if="activatorfield">
                   <v-btn class="tracer_image_edit" v-if="editssm" icon color="orange" @click.stop="$emit('showssmlabeldialog')">
                        <v-icon>mdi-image-edit-outline</v-icon></v-btn>
                    <v-btn class="tracer_image_detail" icon color="primary" @click="activatorclicked">
                    <v-icon>mdi-details</v-icon></v-btn>

                </v-col>
            </v-row>

             <v-speed-dial
                     v-if="!activatorfield"
              v-model="fab"

                     bottom
              right
              direction="left"
              absolute
              open-on-hover
              transition="slide-x-reverse-transition"
            >
              <template v-slot:activator>
                <v-btn
                  v-model="fab"
                  color="blue darken-2"
                  dark
                  fab
                  small
                >
                  <v-icon v-if="fab">
                    mdi-close
                  </v-icon>
                  <v-icon v-else>
                    mdi-folder-multiple-image
                  </v-icon>
                </v-btn>
              </template>
              <v-btn
                fab
                dark
                small
                color="orange"
                v-if="editssm"
                @click.stop="$emit('showssmlabeldialog')"
              >
                <v-icon>mdi-image-edit-outline</v-icon>
              </v-btn>
              <v-btn
                fab
                dark
                small
                color="green"
                v-if="!checkDefaultImgName(getterAllEntries[ssmid].resized_img)"
                @click="_src=getterAllEntries[ssmid].resized_img"
              >
                <v-icon>mdi-image-filter-center-focus</v-icon>
              </v-btn>
              <v-btn
                fab
                dark
                small
                color="indigo"
                v-if="!checkDefaultImgName(getterAllEntries[ssmid].man_labeled_img)"
                @click="_src=getterAllEntries[ssmid].man_labeled_img"
              >
                <v-icon>mdi-image-marker-outline</v-icon>
              </v-btn>
              <v-btn
                fab
                dark
                small
                color="blue"
                v-if="!checkDefaultImgName(getterAllEntries[ssmid].modified_img)"
                @click="_src=getterAllEntries[ssmid].modified_img"
              >
                <v-icon>mdi-image-marker</v-icon>
              </v-btn>
            </v-speed-dial>
        </v-container>
    </v-img>
</template>

<script>
    import axios from "axios";
    import {mapGetters} from "vuex";

    export default {
        name: "AuthImg",
        props: ['src','auth', 'width','height','contain','activatorfield','cachebreaker','protected','editssm','ssmid','imgonly'],
         components: {},
        data() {
            return {
                fab: null,
                src_img: null,
            }
        },
        computed: {
            ...mapGetters('imagecenter',['getterAllEntries','getterNumericStatus']),
            _src: {
                get() {
                    return this.src_img ? this.src_img : this.src
                },
                set(val) {
                    this.src_img=val ? val : this.src
                }
            }
        },

        asyncComputed: {
            retrieveAuthImage: {

                get() {
                    if ((this._src.includes('protected')) || (this.protected)) {
                        var this1 = this
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const config = {
                                    url: this1._src,
                                    method: 'GET',
                                    headers: {
                                        authorization: this1.auth,
                                        'Content-Type': 'application/json'
                                    },
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    responseType: 'arraybuffer',
                                }
                                axios(config).then(response => {
                                    var mimeType = response.headers['content-type'].toLowerCase();
                                    const buffer = Buffer.from(response.data, 'base64').toString('base64');
                                    resolve('data:' + mimeType + ';base64,' + buffer)
                                }).catch((e) => {
                                    console.log(e)
                                    reject()
                                })
                            }, 1000)

                        })
                    }
                    },
                watch: ['_src'],
                default: null

            }
        },
        methods: {

            timefragment: function (){
                // Cachebreaker time fragment, limit reload to 60s
               return '?t=' + Math.round(new Date().getTime()/60000);
           },
            activatorclicked: function () {
                this.$emit('activatorclicked')
            },

            imageloaded: function () {
                this.$emit('authimageloaded')
            },

            checkDefaultImgName: function (imgname) {
                return imgname.includes('default')
            }
        }



    }
</script>

<style scoped>

</style>