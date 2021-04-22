<template>
    <v-card>
        <v-card-text>
        <markdown-it-vue
                v-if="!mutate"
                class="md-body" :content="content" />


        <v-form v-else
               ref="form"
            v-model="valid"
            lazy-validation>
          <v-file-input
                accept=".md"
                label="Markdown File input"
                  v-model="chosenFile"
            ></v-file-input>
            </v-form>
            </v-card-text>
        <v-card-actions v-if="mut">
            <v-btn v-if="!mutate" icon
            @click="mutate=true"><v-icon color="grey lighten-1">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon v-if="mutate"
            @click="submit"><v-icon color="grey lighten-1">mdi-check</v-icon>
            </v-btn>
        </v-card-actions>
    </v-card>


</template>

<script>
    import axios from "axios";

    import MarkdownItVue from 'markdown-it-vue'
    import 'markdown-it-vue/dist/markdown-it-vue.css'

    export default {

        props: {
            document_url:String,
            mutable: Boolean,
        },
        components: { MarkdownItVue},
      methods: {
            showItem: function() {
                   var config = {
                            method: 'GET',
                            url: this.docurl,
                            headers: {
                                  authorization: `Bearer ${this.$store.state.token}`,
                                  'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache',
                              },
                              xhrFields: {
                                  withCredentials: true
                              },
                        };
                    axios(config).then((response)=>{
                        this.content = response.data;
                    }).catch((e)=> {
                        console.log(e)
                    })
            },
          submit: function() {
                 if (this.$refs.form.validate()) {
                     const tempform = new FormData();
                     tempform.append('document', this.chosenFile)
                     this.$store.dispatch('auth/updateAccountDetails', tempform)
                         .then((response) => {
                             this.mutate = false
                             this.newdoc_url = response.data.document
                             this.showItem();
                         }).catch((e) => {
                         console.log('Document upload failed: ', e)
                     })
                 }
            },
      },
        data() {
          return {
              valid:false,
              content:'',
              chosenFile:null,
              mutate:false,
              newdoc_url:null,
          }
        },
        mounted() {
           this.showItem();
        },
  computed: {
        mut() {
            return this.mutable ? this.mutable : false
        },
        docurl() {
            return this.newdoc_url ? this.newdoc_url : this.document_url
        }
  }
    };
</script>
