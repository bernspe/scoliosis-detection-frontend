<template>
        <v-card>

                <v-card-title
                  class="headline"
                  v-text="title"
                ></v-card-title>
            <v-container>
        
                <v-row
                        v-for="entry in getterEntries" :key="entry.id"
                >
                <v-col>
                    <v-card
                        class="pa-2"
                        outlined
                        tile
                    >
                          <v-text-field
                            v-model="entry.title"
                            label="Entry Title"
                            outlined
                          ></v-text-field>

                        <v-list three-line>
                          <template v-for="(item, index) in entry.fdata.EndVertebrae">

                            <v-list-item
                              :key="index"
                            >
                              <v-list-item-content>
                                <v-list-item-title v-html="item"></v-list-item-title>
                                <v-list-item-subtitle v-html="entry.fdata.COBBAngles[index]"></v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </template>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>Process-Status</v-list-item-title>
                                    <v-list-item-subtitle v-html="entry.status"></v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-col>

                <v-col
                      class="d-flex child-flex"
                      cols="3"
                    >
                      <v-img
                        :src=entry.img

                        aspect-ratio="1"
                        class="grey lighten-2"
                      >
                      </v-img>
                </v-col>


                <v-col
                      class="d-flex child-flex"
                      cols="3"
                    >
                      <v-img
                        :src=entry.modimg

                        aspect-ratio="1"
                        class="grey lighten-2"
                      >
                      </v-img>
                </v-col>

                        <template v-slot:placeholder>
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
            </v-row>
        </v-container>

    </v-card>
</template>

<script>

    import axios from "axios";

    export default {
    props: {
      showAll: Boolean,
    },
    data: () => ({
      title:'XR Machine List',
        logosrc: '../assets/s_logo.png',


    }),
        computed: {
            getterEntries: function () {
                if (this.showAll){
                    return this.$store.getters.getterAllEntries
                }
                else {
                    return this.$store.getters.getterSelectedEntries
                }
            },
        },


        methods: {
          refreshEntries () {
              const base = {
                           baseURL: this.$store.state.endpoints.baseUrl,
                           headers: {
                               Authorization: `Token ${this.$store.state.token}`,
                               'Content-Type': 'application/json'
                           },
                           xhrFields: {
                               withCredentials: true
                           }
                       }
              const axiosInstance = axios.create(base)
                       axiosInstance({
                           url: this.$store.state.endpoints.splineAppUrl,
                           method: "get",
                           params: {}
                       }).then((response) => {
                               const data = response.data
                               this.$store.commit('setListData', {entries: data});

                           })
          }

          }


    };
</script>
