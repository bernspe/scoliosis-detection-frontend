<template>
    <v-container>
    <v-card-title>{{ ssm.title }}
    </v-card-title>

            <v-card-subtitle>Eigentümer: {{ ssm.owner_fullname }}</v-card-subtitle>
            <v-card-subtitle>Aufnahmedatum: {{ formatDate(ssm.created) }}
            <v-icon color="grey lighten-1"
                    @click="change_date=!change_date"
            >mdi-pencil</v-icon>
            </v-card-subtitle>
            <v-row v-if="change_date">
            <v-date-picker
                  v-model="ssm_created_date"
                  type="date"
                  class="mt-4"
                ></v-date-picker>
                </v-row>
                <v-card-text v-if="isDiscarded">
                    <v-icon color="red" large>mdi-alert-octagon-outline</v-icon>
                    <v-card-title>Fehlerhaftes Bild</v-card-title>
                </v-card-text>

                    <v-card-subtitle v-if="ssm.hasResult">Ergebnisse</v-card-subtitle>

                    <v-card-text v-if="ssm.hasResult && ssm.type=='process_upright'">
                        Rumpfasymmetrie: {{ getSquaredDistances.mean }} &#177; {{ getSquaredDistances.std }}
                    </v-card-text>
                    <v-card-text v-if="ssm.hasResult && ssm.type=='process_bendforward'">
                            Adams - Angle: {{ getAdamsAngle }}
                    </v-card-text>
                    <v-card-text v-if="ssm.hasResult && ssm.type=='process_xray_cobb'">
                        <v-row dense>
                        <v-col cols="6">
                            <v-subheader>SPLINE</v-subheader>
                            <v-list-item v-for="(item,index) in getCOBBAngles.zip_SPLINE" :key="index">
                                    <v-list-item-content>
                                        <v-list-item-title v-html="item[0]"></v-list-item-title>
                                        <v-list-item-subtitle v-html="item[1]"></v-list-item-subtitle>
                                    </v-list-item-content>
                            </v-list-item>
                        </v-col>
                        <v-col cols="6">
                            <v-subheader>COBB</v-subheader>
                            <v-list-item v-for="(item,index) in getCOBBAngles.zip_COBB" :key="index">
                                    <v-list-item-content>
                                        <v-list-item-title v-html="item[0]"></v-list-item-title>
                                        <v-list-item-subtitle v-html="item[1]"></v-list-item-subtitle>
                                    </v-list-item-content>
                            </v-list-item>
                            </v-col>
                        </v-row>

                        <GChart
                            type="BarChart"
                            :settings="{ packages: ['corechart', 'table', 'map'] }"
                            :data="getCOBBDataTable"
                            :options="chartOptions"
                         />
                    </v-card-text>

                <v-card-actions>

                    <v-btn
                        @click="delSSM"
                        color="red"
                        outlined
                        v-show="(getterUsernameSimple==ssm.owner_username) && deletebtn"
                        :loading="deleting"
                        >Löschen
                        <v-icon
                            right
                            dark
                          >
                            mdi-delete
                          </v-icon>
                        </v-btn>

                    <v-btn
                        @click="closeDlg"
                        color="red"
                        outlined
                        v-show="closebtn"
                        >Schließen
                        <v-icon
                            right
                            dark
                          >
                            mdi-close
                          </v-icon>
                        </v-btn>
                </v-card-actions>
</v-container>
</template>

<script>
    import {mapGetters} from "vuex";
    import {mean, round, std} from "mathjs";

    export default {
        name: "SSMItemContent",

        props: {
            ssm: Object,
            id: String,
            closebtn: Boolean,
            deletebtn: Boolean,
        },
        data ()  {
            return {
                ssm_created_date: null,
                change_date: false,
                deleting: false,
                chartOptions: {
                    bars: 'horizontal',
                    legend: { position: "none" },
                    title: "Winkel"
                  }
            }
        },
        computed: {
            ...mapGetters('auth',['getterUsernameSimple']),
            isDiscarded: function () {
                return this.ssm.type == 'discarded'
            },

            getSquaredDistances: function () {
                let res = this.ssm.formatted_data.MEASURE_LEVEL2_result.SquaredDistances
                return {'mean':round(mean(res),2), 'std': round(std(res),2)}
            },
            getAdamsAngle: function() {
                return round(this.ssm.formatted_data.MEASURE_LEVEL2_result.Humpangle,0)
            },
            getCOBBAngles: function() {
                let e=this.ssm
                    return {
                        'COBB_vertebrae': e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae,
                        'COBB_vertebrae_formatted':e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae.map((k) => [k[0]+' - '+k[1]]),
                        'COBB_angles': e.formatted_data.MEASURE_LEVEL2_result.COBB_angles,
                        'SPLINE_vertebrae':e.formatted_data.MEASURE_LEVEL2_result.SPLINE_vertebrae,
                        'SPLINE_angles':e.formatted_data.MEASURE_LEVEL2_result.SPLINE_angles,
                        'zip_COBB': e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae.map((k, i) => [k[0]+' - '+k[1]+': ', e.formatted_data.MEASURE_LEVEL2_result.COBB_angles[i]]),
                        'zip_SPLINE': e.formatted_data.MEASURE_LEVEL2_result.SPLINE_vertebrae.map((k, i) => [k[0]+' - '+k[1]+': ', e.formatted_data.MEASURE_LEVEL2_result.SPLINE_angles[i]])
                    }
            },
            getCOBBDataTable: function() {
                let e=this.ssm
                let res=[]
                if (Object.prototype.hasOwnProperty.call(e.formatted_data.MEASURE_LEVEL2_result,'SPLINE_vertebrae')) {
                    res.push(...e.formatted_data.MEASURE_LEVEL2_result.SPLINE_vertebrae.map((k, i) => [k[0]+' - '+k[1]+': ', e.formatted_data.MEASURE_LEVEL2_result.SPLINE_angles[i], this.COBBcolors(e.formatted_data.MEASURE_LEVEL2_result.SPLINE_angles)[i],e.formatted_data.MEASURE_LEVEL2_result.SPLINE_angles[i] +' (SPLINE)'].flat(1)))
                }
                if (Object.prototype.hasOwnProperty.call(e.formatted_data.MEASURE_LEVEL2_result,'COBB_vertebrae')) {
                    res.push(...e.formatted_data.MEASURE_LEVEL2_result.COBB_vertebrae.map((k, i) => [k[0]+' - '+k[1]+': ', e.formatted_data.MEASURE_LEVEL2_result.COBB_angles[i], this.COBBcolors(e.formatted_data.MEASURE_LEVEL2_result.COBB_angles)[i],e.formatted_data.MEASURE_LEVEL2_result.COBB_angles[i]+' (COBB)' ].flat(1)))
                }

                    return [
                        ['Region','Angle',{ role: 'style' }, { role: 'annotation' }],... res
                    ]
            }

        },
        methods: {
            closeDlg: function () {
              this.$emit('closeSSMItemContent')
            },
          delSSM: function () {
                this.deleting=true
             this.$store.dispatch('imagecenter/deleteSSM',{id:this.id})
               .then(()=> {
                   this.$emit('ssmdeleted')
               }).finally(()=> this.deleting=false)
           },
            formatDate (date) {
                const [year, month, day] = date.split(/-|T/)
                return (day + '.' + month + '.' + year)
            },
            COBBcolors(value) {
                return value.map(value => {
                    if (value <= 20) return "green"
                    if (value <= 25) return "yellow"
                    if (value <= 40) return "orange"
                    if (value > 40) return "red"
                    return "grey"
                });
            },

        },
        watch: {
            ssm_created_date: function (newVal, oldVal){
                if (newVal!=oldVal) {
                    let t=new Date().toISOString().substr(10)
                    this.$store.dispatch('imagecenter/updateSSM',{id:this.id, created: newVal+t})
                    this.change_date=false
                }
            }
        }
    }
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}

</style>