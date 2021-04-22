
<template>
    <v-row justify="center">
<v-col cols="6" sm="10" md="8" lg="6">
       <h1>Consent Documents</h1>

          <v-data-table
            :headers="headers"
            :items="consentlist"
            item-key="id"
            sort-by="created"
            group-by="consent_type"
            class="elevation-1"
                  :expanded.sync="expanded"
                  :single-expand="singleExpand"
                      show-expand
          >
               <template v-slot:expanded-item="{ headers, item }">
                  <td :colspan="headers.length">
                    Creator {{ item.createdby }}
                  </td>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="showItem(item)"
                  >
                    mdi-file-download
                  </v-icon>
                  <v-icon
                    small
                    @click="deleteItem(item)"
                  >
                    mdi-delete
                  </v-icon>
    </template>
          </v-data-table>
            <v-fab-transition>
              <v-btn
                v-show="showcreate & !showcreateform"
                @click="showcreateform = true"
                color="pink"
                dark

                bottom
                right
                fab
              >
                <v-icon>mdi-plus</v-icon>

              </v-btn>
            </v-fab-transition>

        <v-divider inset></v-divider>

    <div v-if="showcreateform">
    <h1>
        Submit New Consent Document
    </h1>
          <v-form
                  @submit.prevent="submit"
               ref="form"
            v-model="valid"
            lazy-validation
          >
              <v-select
                      v-model="select"
                  :items="consenttypes"
                  :hint="`${select.value} : ${select.text}`"
                  label="Consent Types"
                  outlined
                      persistent-hint
                    return-object
                ></v-select>
              <v-file-input
                accept=".md"
                label="MD File input"
                v-model="chosenFile"
              ></v-file-input>
              <v-text-field
              label="Additional information"
              v-model="addinfo">
              </v-text-field>

              <v-btn
                      :disabled="!valid"
                color="success"
                class="mr-4"
                      type="submit">
                  Create Consent Document
              </v-btn>
                  <v-btn
                  color="error"
                  class="mr-4"
                  @click="reset"
                >
                  Reset Form
                </v-btn>
          </v-form>
    </div>
</v-col>
    <v-col cols="6" sm="10" md="8" lg="6">
        <v-card>
            <v-card-title>Document content</v-card-title>
        <v-card-text>
              <div>
                <markdown-it-vue class="md-body" :content="content" />
              </div>
            </v-card-text>
            </v-card>
    </v-col>
        </v-row>
</template>


<script>
    import axios from "axios";

    import MarkdownItVue from 'markdown-it-vue'
    import 'markdown-it-vue/dist/markdown-it-vue.css'
    export default {
        props: {
        },
        components: { MarkdownItVue},
        data: () => ({
            showcreate: true,
            showcreateform: false,
            singleExpand: true,
            expanded: [],
            headers: [
          {
            text: 'ID',
            align: 'start',
            value: 'id',
            groupable: false,
          },
          { text: 'Consent Type', value: 'consent_type', align: 'right' },
          { text: 'Created', value: 'created', align: 'right' },
                { text: '', value: 'data-table-expand' },
                { text: 'Actions', value: 'actions', sortable: false },
        ],
            select: {value:'',text:''},
            consenttypes:[],
            valid:false,
            chosenFile:null,
            addinfo:'',
            consentlist:[],
            content:"",
        }),

        methods: {
            showItem: function(item) {
                   var config = {
                            method: 'GET',
                            url: item.document,
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config).then((response)=>{
                       // this.content = md.render(response.data);
                        this.content = response.data;
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
            deleteItem: function(item) {
                var this1=this;
                var config = {
                            method: 'DELETE',
                            url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX+item.id+'/',
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config).then(()=>{
                        var config2 = {
                            method: 'GET',
                            url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX,
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json'
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                        axios(config2).then(function (response) {
                              this1.consentlist = response.data;
                            }).catch((error) => {
                              console.log(error)
                             });
                    }).catch((e)=> {
                        console.log(e)
                    })
            },

            submit: function() {
                const tempform = new FormData();
                tempform.append('consent_type', this.select.value);
                tempform.append('document',this.chosenFile)
                tempform.append('add_info',this.addinfo)
                var config = {
                        method: 'POST',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX,
                        data: tempform,
                        headers: {
                              authorization: `Bearer ${this.$store.state.token}`,
                              'Content-Type': 'multipart/form-data'
                          },
                          xhrFields: {
                              withCredentials: true
                          },
                    };
                axios(config).then((response)=>{
                    console.log(response)
                }).catch((e)=> {
                    console.log(e)
                })

            },
            reset () {
              this.$refs.form.reset()
            },
        },
        watch: {
          showcreateform: function (val) {
              //retrieve Consent Types List
                 if (val) {
                     var this1 = this;
                     axios.get(this.$store.state.endpoints.consenttypes).then(function (response) {
                         this1.consenttypes = response.data;
                     }).catch((error) => {
                         console.log(error)
                     });
                 }

          }
        },

        mounted() {
            //retrieve Consent Forms List
            var this1=this;
            var config = {
                        method: 'GET',
                        url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_CONSENTDOCUMENTS_SUFFIX,
                        headers: {
                              authorization: `Bearer ${this.$store.state.token}`,
                              'Content-Type': 'application/json'
                          },
                          xhrFields: {
                              withCredentials: true
                          },
                    };
            axios(config).then(function (response) {
              this1.consentlist = response.data;
            }).catch((error) => {
              console.log(error)
             });
        }
    };
</script>
