<template>
<v-container>
    <v-progress-linear
      indeterminate
      color="cyan"
      v-if="col_loading"
    ></v-progress-linear>

    <!-- User is child, adult or individual patient -->
    <v-container v-if="(isAdult||isChild) && (!isStaff)" id="tracer_metrixcenter_tableau">
          <v-sheet
            elevation="8"
            v-for="(data,didx) in chartDataCollection.filter(x=> x.owner === getterUsernameSimple)" :key="didx"
          >
               <SSMGChart :data="data"></SSMGChart>
          </v-sheet>
    </v-container>

    <!-- User is Caregiver -->
    <v-container v-if="isCaregiver" id="tracer_metrixcenter_tableau_caregiver">
        <v-row v-for="(user,idx) in items_med_caregiver" :key="idx">
            <v-col cols="12">
                    <h1>{{ user.first_name }}</h1>
                </v-col>
            <v-divider></v-divider>
            <v-col cols="12">
                      <v-sheet
                        elevation="8"
                        v-for="(data,didx) in chartDataCollection.filter(x=> x.owner === user.username)" :key="didx"
                      >
                           <SSMGChart :data="data"></SSMGChart>
                      </v-sheet>
            </v-col>
        </v-row>
    </v-container>


    <!-- User is MedProfessional -->
    <v-container v-if="isMed" id="tracer_metrixcenter_tableau_med">
         <v-data-table
                      :headers="headers_med"
                      :items="items_med_caregiver"
                      item-key="username"
                      class="elevation-1"
                      single-expand
                        :expanded.sync="expanded_med"
                      show-expand
                      :search="search"
                    >
                      <template v-slot:top>
                        <v-text-field
                          v-model="search"
                          label="In meinen Patienten suchen"
                          class="mx-4"
                        ></v-text-field>
                      </template>
                    <template v-slot:expanded-item="{ headers, item }">
                      <td :colspan="headers.length">
                       <v-sheet
                        elevation="8"
                        v-for="(data,didx) in chartDataCollection.filter(x=> x.owner === item.username)" :key="didx"
                      >
                           <SSMGChart :data="data"></SSMGChart>
                      </v-sheet>
 <!---
                                 <v-slide-group
                                          v-model="col_model"
                                          class="pa-4"
                                  show-arrows
                                  center-active>
                                    <v-slide-item v-for="(entry,id) in getCollectionEntriesByUser(item.username)" :key="id" class="ma-2">
                                        <CollectionItem :collection="entry" :id="id" :fullname="item.name" @collectiondeleted="loadCollections"></CollectionItem>
                                    </v-slide-item>
                                </v-slide-group>
 --->
                      </td>
                    </template>
         </v-data-table>
        </v-container>
    <v-tour name="MetrixcenterTour" :steps="tourSteps" :options="tourOptions"></v-tour>
</v-container>
</template>


<script>
    //import CollectionItem from "@/components/SSMCenter/CollectionItem";
    import {mapActions, mapGetters} from "vuex";
    import SSMGChart from "@/components/MetrixCenter/SSMGChart";
    import component_tracer from "@/mixins/component_tracer";

        function formatDate (date) {
                const [year, month, day] = date.split(/-|T/)
                return (day + '.' + month + '.' + year)
    }

    export default {
        name: 'Metrixcenter',
        mixins: [component_tracer],
        components: {SSMGChart},
        data: () => ({
                        col_loading: false,
                         col_model:null,
                        expanded_med: [],
                        expanded_staff: [],
                        search: '',
                     }),
          computed: {
              ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname', 'isChild', 'isAdult', 'isPatient', 'isCaregiver', 'isMed', 'isStaff', 'getterDependentChildren', 'getterMyPatients']),
              ...mapGetters("imagecenter", ['getterCollections', 'getterAllCollectionEntries', 'getterTypeLabels','getterAllEntriesAsArray']),
              ...mapGetters("caseroom", ["getParticipantsChildrenNAdultsNPatients"]),

              headers_med() {
                return [
                    {
                        text: 'Name',
                        align: 'start',
                        sortable: true,
                        value: 'name'
                    },
                    {
                        text: 'Geburtsdatum',
                        sortable: true,
                        value: 'bd_formatted',
                    },

                ]
            },
              items_med_caregiver() {
                let it = this.isMed ? this.getterMyPatients : this.isCaregiver ? this.getterDependentChildren : null
                let res = []
                if (it) {
                    res = it.map((x) => {
                        return {
                            ...x,
                            bd_formatted:x.date_of_birth ? formatDate(x.date_of_birth) : null
                        }

                    })
                }
                return res
            },

          },
        asyncComputed: {
            chartDataCollection: {
                get() {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            this.col_loading=true
                            this.$store.dispatch('imagecenter/get_gviz_data_for_ssms')
                                .then((result) => {
                                    resolve(result)
                                })
                                .catch((e) => reject(e))
                                .finally(() => this.col_loading=false)
                        }, 1000)
                    })
                },
                default: [],
                watch: ['getterAllEntriesAsArray']
            }
        },
        methods: {
            ...mapActions('imagecenter',['get_gviz_data_for_ssms']),

            loadCollections: function() {
                 this.col_loading=true
                  this.$store.dispatch('imagecenter/getcollection_user_list')
                    .finally(() => this.col_loading=false)
            },
            getCollectionEntriesByUser: function(username)  {
              if (username && this.getterCollections) {
                  const subarray = Object.entries(this.getterCollections)
                  let subObj = subarray.filter((x) => x[1].owner_username === username)
                  return Object.fromEntries(subObj)
              }
            },
        },
        mounted() {

        //  this.loadCollections()
        },
    };
</script>
