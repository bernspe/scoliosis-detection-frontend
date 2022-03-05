<template>
    <v-card
            class="ma-4 my-12"
    >
        <v-row>
            <v-col cols="10">
                <v-card-title>{{ fullname ? (fullname+': ') : null }}  {{formatDate(collection.created)}} &#177; 6 Wochen</v-card-title>
            </v-col>
            <v-col cols="2">
                <v-progress-circular
                        v-if="isLoading"
                        indeterminate
                        color="primary"
                        class="ma-2"
                        :size="20"
                        :width="2"
                      ></v-progress-circular>
            </v-col>
        </v-row>

        <v-container justify="space-between" v-for="(m,index) in measures" :key="index">
            <v-row v-if="(m.result) && (m.result.count>0)">
                <v-col cols="6" align-self="start">
                <v-card-text>
                    {{m.description}} = {{ m.result.mean }} &#177; {{ m.result.std }}
                </v-card-text>
                </v-col>
                    <v-col cols="6" align-self="end">
                <v-btn color="indigo"
                        @click="getSSMs(m.result.ids, index)"
                        outlined
                        class="ma-2"
                        v-if="!ids[index]"
                        :disabled="isLoading">
                            <v-icon>
                                mdi-folder-multiple-image
                            </v-icon>
                            <span v-if="$vuetify.breakpoint.smAndUp">Bilder laden</span>
                        </v-btn>
                                <v-btn color="indigo"
                        @click="closeSSMs(index)"
                        outlined
                        v-if="ids[index]">
                            <v-icon>
                                mdi-close-box-multiple
                            </v-icon>
                            <span v-if="$vuetify.breakpoint.smAndUp">Bilderzeile schließen</span>
                        </v-btn>

                    </v-col>

                               <v-slide-group
                      v-model="model[index]"
                      class="pa-2"
                      show-arrows
                      v-if="ids[index]"
                    >
                      <v-slide-item
                        v-for="(entry,id) in getEntriesByIds(index)" :key="id"
                      >
                        <SSMItem mini :ssm="entry" :id="id"></SSMItem>
                      </v-slide-item>
                    </v-slide-group>
                </v-row>

             </v-container>
            <v-row>
                <v-col>
                <v-card-title>Diagnosen</v-card-title>
                <v-card-text>
                <v-chip-group
                        active-class="primary--text"
                        column
                      >
                        <v-chip
                          v-for="d in collection.diagnoses"
                          :key="d.id"
                        >
                          {{ getDiagnosisText(d.diagnosis) }} ({{ d.physician_fullname }})
                        </v-chip>
                      </v-chip-group>
                </v-card-text>
                <v-card-text
                v-if="isMed">
                <v-select
                 :items="DIAGNOSIS_LABELS_DE"
                 dense
                 label="Diagnose"
                 hint="Bitte Diagnose setzen"
                 persistent-hint
                 v-model="diagnosis"
                 @change="setDiagnosis({id:id, diagnosis:diagnosis})"
                ></v-select>
                    </v-card-text>
                    </v-col>
            </v-row>
    </v-card>
</template>

<script>
    import {mapGetters, mapState} from "vuex";
    import { pick as _pick } from 'lodash';
    import SSMItem from "@/components/SSMCenter/SSMItem";

    export default {
        name: 'Collectionitem',
        components: {SSMItem},
        props: {
            fullname: String,
            mini: Boolean,
            collection: Object,
            id: String,
        },
        data: () => ({
            isLoading:false,
            diagnosis:null,
            diagnoses: [],
            model:[null,null,null],
            ids:[null,null,null],
                     }),
        computed: {
           ...mapState('imagecenter',['DIAGNOSIS_LABELS_DE']),
            ...mapGetters('imagecenter',['getterCollectionSquaredDistances','getterCollectionAdamsAngle','getterCollectionCOBBAngles','getterAllCollectionEntries']),
            ...mapGetters('auth',['isMed']),
            ...mapGetters('caseroom',['getParticipantFullname']),
            measures: function() {
               return [{    description: 'Rumpfasymmetrie',
                            result: this.getterCollectionSquaredDistances(this.id)
                        },
                         {  description: 'Rippenbuckel',
                             result:this.getterCollectionAdamsAngle(this.id)},
                        {description: 'COBB-Winkel',
                            result:this.getterCollectionCOBBAngles(this.id)}]
            },
        },

        methods: {
            formatDate (date) {
                const [year, month, day] = date.split(/-|T/)
                return (day + '.' + month + '.' + year)
            },

            // SSM Management
            getSSMs(ids,index) {
                this.isLoading=true
                var this1=this
                this.$store.dispatch('imagecenter/getssm_id_list',{ids:ids})
                .finally(()=> {
                    this1.isLoading=false
                    this1.ids[index]=ids
                })
            },

            closeSSMs(index){
                this.ids.splice(index,1,null)
            },

            // Collection Management
            getEntriesByIds(index) {
                if (this.ids[index]) {
                    let subObj = _pick(this.getterAllCollectionEntries, this.ids[index])
                    return subObj
                }
            },

            setDiagnosis(payload){
                this.$store.dispatch('imagecenter/add_diagnosis_to_collection',payload)
            },

            getDiagnosisText(value){
                let li=this.DIAGNOSIS_LABELS_DE
                return li.filter((x) => x.value==value)[0].text
            }
        },
    };
</script>
