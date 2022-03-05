<template>
    <v-card class="pa-2">
        <v-row>
        <v-col cols="6">
        <v-card-title>Title: {{ title }}</v-card-title>
        <v-card-subtitle>Version: {{ version }}</v-card-subtitle>
        <v-card-subtitle>Type: {{ type }}</v-card-subtitle>
        <v-card-text>
            ID: {{ id }}
        </v-card-text>
            <v-card-text>
                Created: {{ convertdt(created, 'datetime')}}
            </v-card-text>
        </v-col>

            <v-col cols="6">
            <v-switch
              v-model="mlmodel_active"
              label="active"
              color="success"
            ></v-switch>
                <v-img
                v-if="perf_graph"
                :src="baseUrl+perf_graph+`?time=`+currentTimeString"
                :width="width"
                contain>

                </v-img>
                <v-slider
                            v-if="perf_graph"
                      v-model="width"
                      class="align-self-stretch"
                      min="200"
                      max="500"
                      step="1"
                    ></v-slider>
                <v-progress-circular
                                v-if="isLoading"
                                indeterminate
                                color="primary"
                                :size="20"
                                :width="2"
                              ></v-progress-circular>
            </v-col>
        </v-row>
        <v-card-actions>
            <v-btn
                    v-if="!((type==`dataset`) || (type==`dummy`))"
            color="purple"
            text
            @click="getperformances"
            outlined
          > <v-icon>
            mdi-chart-bar
          </v-icon>
            Get Model Performances
          </v-btn>


            <v-btn
                @click="delMLModel"
                color="red"
                outlined
                >Löschen
                <v-icon
                    right
                    dark
                  >
                    mdi-delete
                  </v-icon>
                </v-btn>
            <MLTerminal v-bind="$props"></MLTerminal>
        </v-card-actions>
    </v-card>
</template>

<script>

   import MLTerminal from "@/components/MLManager/MLTerminal";
   import {mapState} from "vuex";
   import DateTime from "luxon/src/datetime";

   export default {
       components: {
           MLTerminal
       },
       data () {
          return {
            val_model_active: null,
                perf_graph: null,
              width: 200,
              isLoading: false,


          }
       } ,
       computed: {
            ...mapState({baseUrl: state => state.endpoints.baseUrl.substr(0,state.endpoints.baseUrl.length-1)}),
       currentTimeString () {
          return Date.now().toString()
        },
           mlmodel_active: {
                    get: function () {
                        return this.val_model_active ? this.val_model_active : this.is_active
                    },
                    set: function (newValue) {
                        this.$store.dispatch('mlmodel/updateMLModel', {id: this.id, is_active: newValue})
                        .then(()=> {
                            this.val_model_active = newValue
                            this.$emit('mlmodelupdated')
                        })
                        .catch((e)=> console.log(e))


                    }
           },



       },
       props: {
           id: String,
           title: String,
           status: String,
           type:String,
           version: String,
           is_active: Boolean,
           files: Array,
            created: String,
        },
       methods: {
        getperformances: function() {
            this.isLoading=true
            this.$store.dispatch('mlmodel/getMLModelPerformanceGraph',{id:this.id})
            .then((result)=> this.perf_graph = result.data.model_performance)
            .catch((e)=> console.log(e))
            .finally(()=>this.isLoading=false)
        },
           delMLModel: function () {
             this.$store.dispatch('mlmodel/deleteMLModel',{id:this.id})
               .then(()=> {
                   this.$emit('mlmodeldeleted')
               })
           },
           convertdt: (dt, format) => {
                    const dtc=DateTime.fromISO(dt)
                    let fd=null;
                    if (format === 'datetime') {
                        fd= dtc.toLocaleString(DateTime.DATETIME_MED)
                    }
                    if (format === 'date') {
                        fd= dtc.toLocaleString(DateTime.DATE_MED)
                    }
                    if (format === 'month') {
                        fd=dtc.toFormat('yyyy-LL');
                    }
                    return fd;
            },
       }
   }
</script>