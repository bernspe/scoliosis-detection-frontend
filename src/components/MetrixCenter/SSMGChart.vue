<template>
    <v-row dense>
            <v-progress-linear
      indeterminate
      color="blue"
      v-if="google_loading"
    ></v-progress-linear>
        <v-col cols="12" v-for="(item, index) in data.data" :key="index" class="ma-2">
                                <GChart
                                    type="LineChart"
                                    :data="null"
                                    @ready="onLoaded(...arguments,item.data,item.chartoptions)"
                                  />
                            </v-col>
        </v-row>
</template>

<script>

    export default {
        name: 'Ssmgchart',
        props: ['data'],
        data: () => {
            return {
                google_loading: true,
            }
        },
        computed: {
          configChartWidth() {
                let factor = 1
                if (this.$vuetify.breakpoint.xs) factor = 0.4
                if (this.$vuetify.breakpoint.sm) factor = 0.6
                if (this.$vuetify.breakpoint.md) factor = 0.8
                return 1000*factor
                },
        },
        methods:{
              onLoaded: function(chart, google, data, options){
                    const gdata = new google.visualization.DataTable(data)
                    chart.draw(gdata, {...options,'width':this.configChartWidth})
                  this.google_loading=false
            },
        },

    };
</script>
