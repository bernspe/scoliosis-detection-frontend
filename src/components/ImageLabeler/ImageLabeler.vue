<template>
    <v-card>

        <v-stepper
                v-model="e6"
                vertical
        >
            <v-stepper-step
                    :complete="e6 > 1"
                    step="1"
                    :rules="[() => step1rules]"
            >
                Bildtyp und Zuschneiden
                <small v-if="step1rules!==true"> {{ step1rules }}</small>
            </v-stepper-step>

            <v-stepper-content step="1">
                <v-card class="ma-2 pa-2">
                    <v-row dense>
                        <v-col cols="10">
                            <v-card-title>Stimmt dieser Bildtyp ?</v-card-title>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon v-if="!dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                <v-icon>mdi-information-outline</v-icon>
                            </v-btn>
                            <v-btn icon v-if="dialogInfoSwitch1" @click="dialogInfoSwitch1=!dialogInfoSwitch1">
                                <v-icon>mdi-information</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-card-text id="tracer_imagelabeler_typeclassifier">
                        <v-select
                                :items="getterTypeLabels"
                                v-model="ssmitem.type"
                                @change="changeType(ssmitem,ssmitem.type)">
                        </v-select>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-row dense>
                    <v-col>
                        <v-card-subtitle>Wähle nun den wichtigen Bereich aus! Achte dabei auf eine mittige Platzierung, die
                        Box soll quadratisch bleiben!
                    </v-card-subtitle>
                        </v-col>
                        <v-col><v-progress-circular v-if="cropImgLoading"
                             indeterminate
                             color="grey lighten-5"
        ></v-progress-circular></v-col>
                    </v-row>
                    <v-card-text id="tracer_imagelabeler_cropselector">

                        <v-stage :config="configKonva"
                                 @mousedown="handleStageMouseDown"
                                 @touchstart="handleStageMouseDown">
                            <v-layer>
                                <AuthKonvaImg :src="ssmitem.img" :framesize="configKonva.height"
                                              @imageloaded="saveImgParams1"></AuthKonvaImg>
                            </v-layer>
                            <v-layer>
                                <v-path v-if="ssmitem.type==='process_upright'"
                                        :config="rectangles[1]" @transformend="handleTransformEnd"
                                        @dragend="handleDragEnd"
                                        ref="upright_path"
                                />
                                <v-path v-if="ssmitem.type==='process_bendforward'"
                                        :config="rectangles[2]" @transformend="handleTransformEnd"
                                        @dragend="handleDragEnd"
                                        ref="bend_path"
                                />
                                <v-rect v-if="ssmitem.type==='process_xray_cobb'" :config="rectangles[0]"
                                        @transformend="handleTransformEnd" @dragend="handleDragEnd"></v-rect>
                                <v-transformer ref="transformer"/>
                            </v-layer>
                        </v-stage>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn outlined color="success" class="ma-2" @click="updateImage" :loading="classify_loading">
                            Weiter
                        </v-btn>
                        <v-btn outlined color="red"
                               @click="closeImageLabeler" class="ma-2">
                            Abbruch
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-stepper-content>
            <v-stepper-step
                    step="2"
            >
                Ergebnis der Auswahl
            </v-stepper-step>
            <v-stepper-content step="2">
                <v-card class="ma-2">
                    <v-card-subtitle>Ergebnis der Auswahl</v-card-subtitle>
                    <v-card-text>
                        <v-img :src="resized_img" lazy-src="../../assets/s_logo.png" contain
                               :key="ssmitem.id" :max-width="250">
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
                        </v-img>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn
                                color="primary"
                                outlined
                                @click="e6-=1"
                                class="ma-2"
                        >
                            Zurück
                        </v-btn>
                        <v-btn
                                color="primary"
                                @click="e6+=1"
                                class="ma-2"
                        >
                            Weiter
                        </v-btn>
                        <v-btn outlined color="red"
                               @click="closeImageLabeler" class="ma-2">
                            Abbruch
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-stepper-content>

            <v-stepper-step step="3" :rules="[() => step3rules]">
                Bild bezeichnen
                <small v-if="step3rules!==true"> {{ step3rules }}</small>
            </v-stepper-step>

            <v-stepper-content step="3">
                <v-card class="pa-2">
                    <v-row>
                        <v-col cols="10">
                            <v-card-title v-if="(ssmitem.type==='process_upright')">
                                Taillenlinien durch Punkte zeichnen
                            </v-card-title>
                            <v-card-title v-if="(ssmitem.type==='process_bendforward')">
                                Höchste Erhebung der Rippen auf beiden Seiten durch Punkt bezeichnen
                            </v-card-title>
                            <v-card-title v-if="ssmitem.type==='process_xray_cobb'">
                                Wirbel einzeichnen, ggf. COBB Winkel messen
                            </v-card-title>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon v-if="!dialogInfoSwitch2" @click="dialogInfoSwitch2=!dialogInfoSwitch2">
                                <v-icon>mdi-information-outline</v-icon>
                            </v-btn>
                            <v-btn icon v-if="dialogInfoSwitch2" @click="dialogInfoSwitch2=!dialogInfoSwitch2">
                                <v-icon>mdi-information</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-card v-if="(ssmitem.type==='process_upright') ||(ssmitem.type==='process_bendforward')"
                    >
                        <v-card-subtitle>{{ TYPE_DEP_LABEL_INSTRUCTION[ssmitem.type] }}</v-card-subtitle>
                        <v-row class="ma-2" no-gutters>
                            <v-col cols="6">
                                <v-card-subtitle>Punkte links</v-card-subtitle>
                                <v-progress-circular color="lime"
                                                     :value="pointCount ? pointCount.left/minPointCount*100 : 0"
                                                     :size="70" :width="10">{{ pointCount.left }}
                                </v-progress-circular>
                            </v-col>
                            <v-col cols="6">
                                <v-card-subtitle>Punkte rechts</v-card-subtitle>
                                <v-progress-circular color="deep-orange"
                                                     :value="pointCount ? pointCount.right/minPointCount*100 : 0"
                                                     :size="70" :width="10">{{ pointCount.right }}
                                </v-progress-circular>
                            </v-col>
                        </v-row>
                    </v-card>

                    <v-card v-if="ssmitem.type==='process_xray_cobb'" class="pa-2">
                        <v-card-subtitle id="tracer_imagelabeler_xray_slider">Gib oberen und unteren Wirbel an!
                        </v-card-subtitle>
                        <v-range-slider
                                :min="0"
                                :max="VERTEBRAE_LABELS.length-1"
                                v-model="vls"
                                thumb-label="always"
                                :ticks="true"
                                tick-size="8"
                                label="Wähle zwei Wirbel"
                        >
                            <template v-slot:thumb-label="{ value }">
                                {{ VERTEBRAE_LABELS[value] }}
                            </template>
                        </v-range-slider>
                        <v-switch id="tracer_imagelabeler_cobbswitch" v-model="splinemode"
                                  :label="`Messmethode: ${splinemode ? `Spline` : `COBB`} `" :disabled="!enoughPoints">
                        </v-switch>
                    </v-card>
                    <v-card-text>
                        <v-btn-toggle rounded color="primary" v-if="pointlist.length>0">
                            <v-btn icon small dark color="orange" v-if="zoom===1" @click="toggleZoom">
                                <v-icon>mdi-magnify-plus</v-icon>
                            </v-btn>
                            <v-btn icon small dark color="orange" v-if="zoom>1" @click="toggleZoom">
                                <v-icon>mdi-magnify-minus</v-icon>
                            </v-btn>

                            <v-btn
                                    icon
                                    dark
                                    small
                                    color="green"
                                    @click="moveLastPoint('left')"
                            >
                                <v-icon>mdi-pan-left</v-icon>
                            </v-btn>
                            <v-btn
                                    icon
                                    dark
                                    small
                                    color="green"
                                    @click="moveLastPoint('right')"
                            >
                                <v-icon>mdi-pan-right</v-icon>
                            </v-btn>
                            <v-btn
                                    icon
                                    dark
                                    small
                                    color="green"
                                    @click="moveLastPoint('up')"
                            >
                                <v-icon>mdi-pan-up</v-icon>
                            </v-btn>
                            <v-btn
                                    icon
                                    dark
                                    small
                                    color="green"
                                    @click="moveLastPoint('down')"
                            >
                                <v-icon>mdi-pan-down</v-icon>
                            </v-btn>

                            <v-btn dark small color="purple" @click="xrUndo" icon>
                                <v-icon>mdi-undo</v-icon>
                            </v-btn>
                            <v-btn small outlined color="red" @click="xrRemoveAllPoints">
                                <v-icon>mdi-close-circle-outline</v-icon>
                                Reset
                            </v-btn>
                        </v-btn-toggle>
                        <v-stage :config="{...configKonva, scale: {x: zoom, y: zoom}}"
                                 @click="xrClickHandler"
                                 @touchend="xrClickHandler"
                                 @mousemove="xrMoveHandler"
                                 @touchmove="xrMoveHandler"
                                 @touchstart="cobbTouchStartHandler"
                                 ref="labelStage"
                                 id="tracer_imagelabeler_labelStage"
                        >

                            <v-layer>
                                <AuthKonvaImg :src="resized_img" :framesize="configKonva.width"
                                              @imageloaded="saveImgParams2"></AuthKonvaImg>
                            </v-layer>
                            <v-layer ref="layer">
                                <v-circle
                                        v-for="(item,idx_circle) in pointlist"
                                        :key="idx_circle"
                                        :config="{
                                            x : rescale(item.x), y: rescale(item.y), radius: rescale(7), fill: idx_circle === pointlist.length-1  ? 'green' :'red',
                                          }"></v-circle>
                            </v-layer>
                            <v-layer ref="COBBlayer">
                                <v-line v-for="(line,idx) in COBBlines" :key="'A'+idx"
                                        :config="{points: [rescale(line.start[0]),rescale(line.start[1]),rescale(line.end[0]), rescale(line.end[1])] , stroke: 'red',
                                          strokeWidth: 5,
                                          lineCap: 'round',
                                          lineJoin: 'round'}">
                                </v-line>
                                <v-circle v-for="(angle,idx3) in COBBangles" :key="'C'+idx3"
                                          :config="{
                                                  x: rescale(angle.position[0])+rescale(8),
                                                  y: rescale(angle.position[1])+rescale(8),
                                                  radius: rescale(16),
                                                  fill: 'orange',
                                            }"
                                ></v-circle>
                                <v-text v-for="(angle,idx2) in COBBangles" :key="'B'+idx2"
                                        :config="{
                                                  x: rescale(angle.position[0]),
                                                  y: rescale(angle.position[1]),
                                                  text: angle.degree,
                                                  fontSize: rescale(20),
                                                  fontFamily: 'Calibri',
                                                  fill: 'green',
                                            }"></v-text>
                            </v-layer>


                        </v-stage>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn class="ma-2" outlined color="success" @click="submitPoints" :loading="isComputing"
                               :disabled="!enoughPoints || isComputing">Weiter
                        </v-btn>
                        <v-btn outlined color="red"
                               @click="closeImageLabeler" class="ma-2">
                            Abbruch
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-stepper-content>


        </v-stepper>
        <v-tour name="ImagelabelerTour" :steps="dialogTourSteps" :options="tourOptions"
                :callbacks="dialogTourCallbacks"></v-tour>
    </v-card>
</template>

<script>
    import Vue from 'vue';
    import VueKonva from 'vue-konva';
    import AuthKonvaImg from "@/components/ImageLabeler/AuthKonvaImg";
    import {mapGetters, mapMutations, mapState} from "vuex";
    import component_tracer from "@/mixins/component_tracer";

    Vue.use(VueKonva);

    function avg(array) {
        return array.reduce((a, b) => a + b) / array.length;
    }

    function initialstate() {
        return {
            e6: 1,
            dialogInfoSwitch1: false,
            dialogInfoSwitch2: false,
            dialogTourCallbacks: {},
            ssm_item_val: null,
            imgParams1: null,
            imgParams2: null,
            step1rules: true,
            step3rules: true,
            cropImgLoading: true,
            classify_loading: false,
            rectangles: [
                {
                    x: 100,
                    y: 100,
                    width: 150,
                    height: 150,
                    stroke: "black",
                    strokeWidth: 2,
                    draggable: true,
                    name: 'croprect',
                }, {
                    x: 0,
                    y: 0,
                    name: 'upright_path',
                    draggable: true,
                    stroke: 'black',
                    strokeWidth: 4,
                    data: 'M 2.0404931,2.0404931 H 300.32171 V 300.31791 H 2.0404931 Z M 225.65042,185.9551 c -5.46665,-72.11984 -23.08465,-73.8766 -28.45306,-73.96906 -14.40089,-0.20341 -17.47067,2.32386 -23.32532,0.61641 -4.42047,-1.2883 -10.45195,-5.01141 -15.75651,-16.643041 m 41.0121,204.647721 c -3.59329,-15.71886 -6.05894,-31.80961 -7.36744,-48.07989 -1.60611,-20.03944 -1.02653,-35.16612 -0.49118,-48.07988 0.2456,-5.89287 1.78785,-43.08081 4.42048,-43.14862 1.66995,-0.0494 4.28293,14.79382 8.34977,83.8316 M 77.397847,184.62365 c 5.466641,-72.11982 23.084643,-73.87659 28.457973,-73.96906 14.39598,-0.19725 17.46575,2.33003 23.32041,0.61641 4.42046,-1.28829 10.45194,-5.00524 15.7565,-16.643036 M 103.92064,299.27569 c 3.59415,-15.7186 6.0598,-31.80945 7.36744,-48.07989 1.60611,-20.03328 1.02653,-35.16612 0.49116,-48.07989 -0.24558,-5.89286 -1.78783,-43.07464 -4.42046,-43.14861 -1.66996,-0.0432 -4.28294,14.7938 -8.349773,83.83159 M 183.489,49.013718 c 0,22.46859 -14.62342,40.682982 -32.66232,40.682982 -18.03889,0 -32.66231,-18.214392 -32.66232,-40.682982 0,-22.468591 14.62342,-30.678647 32.66232,-30.678647 18.0389,0 32.66232,8.210056 32.66232,30.678647 z',
                },
                {
                    x: 0,
                    y: 0,
                    name: 'bend_path',
                    draggable: true,
                    stroke: 'black',
                    strokeWidth: 4,
                    data: 'M 169.49521,169.49521 H 370.41682 V 370.41682 H 169.49521 Z m 152.35082,190.46565 q 0.59071,-42.19353 2.9656,-42.29801 1.98511,-0.0844 5.19584,28.9327 l 25.74207,20.00376 a 201.9463,201.9463 0 0 0 -11.74989,-54.33724 c -5.03108,-13.66267 -8.90083,-19.4251 -14.84007,-24.20703 -9.45939,-7.63502 -25.12324,-14.43421 -37.71701,-11.29983 -1.80829,0.45006 -6.04774,2.04538 -12.36471,2.15387 -5.3405,0.0884 -12.1437,0.0884 -14.61504,0.0884 l 12.61386,-0.0281 a 79.191241,79.191241 0 0 1 -12.07941,0 81.497821,81.497821 0 0 1 -12.71431,-2.06146 c -12.24818,-2.61198 -29.04925,3.52014 -38.77788,10.8136 -6.10399,4.57699 -10.08224,10.10636 -15.27004,23.16626 a 181.95059,181.95059 0 0 0 -12.06333,52.00253 l 24.85802,-12.98757 q 3.21475,-29.02915 5.19583,-28.93271 2.37891,0.10447 2.96962,42.29801 m 79.4002,-91.2827 a 25.60143,11.874466 0 0 1 -25.60143,11.87447 25.60143,11.874466 0 0 1 -25.60143,-11.87447 25.60143,11.874466 0 0 1 25.60143,-11.87446 25.60143,11.874466 0 0 1 25.60143,11.87446 z',
                }
            ],
            splinemode: true,
            pointlist: [],
            vls: [1, 16],
            isComputing: false,
            COBBlinedraw: false,
            COBBline_temp: {},
            COBBlines: [],
            COBBangles: [],
            COBBvertebrae: [],
            zoom: 1,

        }
    }

    export default {
        name: 'Imagelabeler',
        mixins: [component_tracer],
        props: {
            edititem: Object,
        },
        components: {AuthKonvaImg},
        data() {
            return initialstate();
        },
        mounted() {
            var this1 = this
            this.dialogTourCallbacks = {
                onFinish: () => {
                    this1.dialogInfoSwitch1 = false;
                    this1.dialogInfoSwitch2 = false
                }
            }
        },
        watch: {
            dialogInfoSwitch1(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal) {
                        this.startTour(true)
                    } else this.stopTour()
                }
            },
            dialogInfoSwitch2(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal) {
                        this.startTour(true)
                    } else this.stopTour()
                }
            },
            splinemode(newVal, oldVal) {
                if (oldVal && !newVal) {
                    this.pointlist.sort((a, b) => a.y - b.y)
                }
            },

        },
        computed: {
            ...mapGetters('imagecenter', ['getterSSMImg', 'getterSSMProtected', 'getterTypeLabels']),
            ...mapGetters(['getterAuthToken']),
            ...mapState('imagecenter', ['TYPE_DEP_LABEL_INSTRUCTION', 'VERTEBRAE_LABELS']),
            dialogTourSteps() {
                return this.dialogInfoSwitch1 ? this.tourSteps.slice(0, 2) : this.dialogInfoSwitch2 ? this.tourSteps.slice(2) : this.tourSteps
            },

            configKonva() {
                let factor = 1
                if (this.$vuetify.breakpoint.xs) factor = 0.6
                if (this.$vuetify.breakpoint.sm) factor = 0.8
                return {
                    width: 500 * factor,
                    height: 500 * factor
                }
            },

            ssmitem: {
                get() {
                    return this.ssm_item_val ? this.ssm_item_val : this.edititem
                },
                set(val) {
                    if (val) this.ssm_item_val = val
                }
            },

            hasMLResults() {
                return this.ssm_item_val ? this.ssm_item_val.hasResult ? this.ssm_item_val.hasResult.includes('1') : false : false
            },

            resized_img() {
                return this.ssm_item_val ? this.ssmitem.resized_img + this.timefragment() : this.edititem.resized_img + this.timefragment()
            },
            modified_img() {
                return this.ssm_item_val ? this.ssmitem.modified_img + this.timefragment() : this.edititem.modified_img + this.timefragment()
            },
            man_labeled_img() {
                return this.ssm_item_val ? this.ssmitem.man_labeled_img + this.timefragment() : this.edititem.man_labeled_img + this.timefragment()
            },
            pointCount() {
                var w = this.configKonva.width / 2
                var al = this.pointlist.filter(x => this.rescale(x.x) < w)
                var ar = this.pointlist.filter(x => this.rescale(x.x) > w)
                return {left: al.length, right: ar.length}
            },
            minPointCount() {
                if (this.ssmitem.type === 'process_upright') return 5
                if (this.ssmitem.type === 'process_bendforward') return 1
                return 0
            },
            enoughPoints() {
                if ((this.ssmitem.type === 'process_upright') || (this.ssmitem.type === 'process_bendforward'))
                    return (this.pointCount.left >= this.minPointCount) && (this.pointCount.right >= this.minPointCount)
                if (this.ssmitem.type === 'process_xray_cobb') {
                    var n_pts = this.vls[1] - this.vls[0]
                    return (this.pointlist.length === n_pts + 1)
                }
                return false
            },
        },

        methods: {
            ...mapMutations(['toggleInformationSwitch']),
            timefragment: function () {
                return '?t=' + Math.round(new Date().getTime() / 1000);
            },
            rescale: function (x) {
                var s = this.imgParams2 ? Math.round(this.imgParams2.scalefactor * x) : x
                return s
            },
            toggleZoom() {
                if (this.zoom === 1) {
                    this.zoom = 3
                } else {
                    this.zoom = 1
                }
                this.reposition()
            },
            reposition() {
                const stage = this.$refs.labelStage.getStage();
                if (this.zoom > 1) {
                    var lp = this.pointlist.at(-1)
                    var w = this.rescale(this.imgParams2.image.width / 2)
                    var h = this.rescale(this.imgParams2.image.height / 2)
                    stage.position({
                        x: this.rescale(lp.x) * this.zoom * -1 + w,
                        y: this.rescale(lp.y) * this.zoom * -1 + h
                    })
                } else {
                    stage.position({x: 0, y: 0})
                }
            },
            moveLastPoint(direction) {
                var lp = this.pointlist.pop()
                if (direction === 'right') {
                    lp.x += 2
                }
                if (direction === 'left') {
                    lp.x -= 2
                }
                if (direction === 'up') {
                    lp.y -= 2
                }
                if (direction === 'down') {
                    lp.y += 2
                }
                this.pointlist.push(lp)
            },
            saveImgParams1(payload) {
                this.imgParams1 = Object.assign({}, payload)
                this.cropImgLoading=false
            },
            saveImgParams2(payload) {
                this.imgParams2 = Object.assign({}, payload)
            },

            changeType: function (item, typeselect) {
                this.$store.dispatch('imagecenter/updateSSM', {id: item.id, type: typeselect})
            },
            updateImage() {
                this.classify_loading = true
                this.step1rules = true
                Vue.set(this.edititem, 'img', '')
                let params;
                let target_x;
                let target_y;
                let target_width;
                let target_height;
                if (this.imgParams1) {

                    if (this.edititem.type === 'process_upright') {
                        const rect = this.rectangles.find(
                            (r) => r.name === 'upright_path'
                        );
                        const cr = this.$refs.upright_path.getNode().getClientRect();
                        target_x = Math.round((cr.x - this.imgParams1.offset_x) / this.imgParams1.scalefactor)
                        target_y = Math.round((cr.y - this.imgParams1.offset_y) / this.imgParams1.scalefactor)
                        target_width = Math.round(cr.height / this.imgParams1.scalefactor)
                        target_height = Math.round(cr.height / this.imgParams1.scalefactor)

                        params = {
                            'target_x': target_x,
                            'target_y': target_y,
                            'target_width': target_width,
                            'target_height': target_height,
                            'target_rotation': rect.rotation
                        }

                    }
                    if (this.edititem.type === 'process_bendforward') {

                        const rect = this.rectangles.find(
                            (r) => r.name === 'bend_path'
                        );
                        const cr = this.$refs.bend_path.getNode().getClientRect();
                        target_x = Math.round((cr.x - this.imgParams1.offset_x) / this.imgParams1.scalefactor)
                        target_y = Math.round((cr.y - this.imgParams1.offset_y) / this.imgParams1.scalefactor)
                        target_width = Math.round(cr.width / this.imgParams1.scalefactor)
                        target_height = Math.round(cr.width / this.imgParams1.scalefactor)

                        params = {
                            'target_x': target_x,
                            'target_y': target_y,
                            'target_width': target_width,
                            'target_height': target_height,
                            'target_rotation': rect.rotation
                        }

                    }
                    if (this.edititem.type === 'process_xray_cobb') {
                        const rect = this.rectangles.find(
                            (r) => r.name === 'croprect'
                        );
                        target_x = Math.round((rect.x - this.imgParams1.offset_x) / this.imgParams1.scalefactor)
                        target_y = Math.round((rect.y - this.imgParams1.offset_y) / this.imgParams1.scalefactor)
                        target_width = Math.round(rect.width * rect.scaleX / this.imgParams1.scalefactor)
                        target_height = Math.round(rect.height * rect.scaleY / this.imgParams1.scalefactor)
                        params = {
                            'target_x': target_x,
                            'target_y': target_y,
                            'target_width': target_width,
                            'target_height': target_height,
                            'target_rotation': rect.rotation
                        }
                    }
                }
                if (params) {
                    this.$store.dispatch('imagecenter/classify_level2', {
                        id: this.edititem.id,
                        type: this.edititem.type,
                        params: params
                    }).catch((e) => this.step1rules = e)
                        .then((res) => {
                            this.ssmitem = Object.assign({}, res.data)
                            this.e6 += 1
                        }).finally(() => this.classify_loading = false)
                } else this.step1rules = 'Typ nicht spezifiziert.'
            },

            submitPoints() {
                this.isComputing = true
                this.step3rules = true
                let params = {}
                if ((this.ssmitem.type === 'process_upright') || (this.ssmitem.type === 'process_bendforward'))
                    params = {coords: this.pointlist}
                if (this.ssmitem.type === 'process_xray_cobb') {
                    params = {
                        coords: this.pointlist, vertebrae: {upper: this.vls[0], lower: this.vls[1]}, manual_cobb: {
                            cobblines: this.COBBlines,
                            cobbvertebrae: this.COBBvertebrae,
                            cobbangles: this.COBBangles
                        }
                    }
                }
                this.$store.dispatch('imagecenter/measure_level2', {id: this.edititem.id, params: params})
                    .then(() => {
                        //this.ssmitem = Object.assign({}, res.data)
                        this.$store.commit('messagehub/setSnackBarMessage', {
                            type: 'info',
                            text: 'Berechnung des Bildes wurde gestartet. Das Ergebnis steht in wenigen Minuten zur Verfügung.'
                        })
                        this.closeImageLabeler()
                    })
                    .catch((e) => this.step3rules = e)
                    .finally(() => {
                        this.isComputing = false;
                    })
            },

            xrUndo() {
                if (this.splinemode) this.removeLastPoint()
                else this.removeLastLine()
            },

            xrRemoveAllPoints() {
                if (this.splinemode) this.removeAllPoints()
                else this.removeAllLines()
            },

            removeLastPoint() {
                this.pointlist.pop()
                this.reposition()
            },

            removeAllPoints() {
                this.pointlist = []
            },

            handleDragEnd(e) {
                const rect = this.rectangles.find(
                    (r) => r.name === this.selectedShapeName
                );
                rect.x = e.target.x();
                rect.y = e.target.y();
                rect.rotation = e.target.rotation();
                rect.scaleX = e.target.scaleX();
                rect.scaleY = e.target.scaleY();
            },
            handleTransformEnd(e) {
                // shape is transformed, let us save new attrs back to the node
                // find element in our state
                const rect = this.rectangles.find(
                    (r) => r.name === this.selectedShapeName
                );
                // update the state
                rect.x = e.target.x();
                rect.y = e.target.y();
                rect.rotation = e.target.rotation();
                rect.scaleX = e.target.scaleX();
                rect.scaleY = e.target.scaleX();

            },
            handleStageMouseDown(e) {
                // clicked on stage - clear selection
                if (e.target === e.target.getStage()) {
                    this.selectedShapeName = '';
                    this.updateTransformer();
                    return;
                }

                // clicked on transformer - do nothing
                const clickedOnTransformer =
                    e.target.getParent().className === 'Transformer';
                if (clickedOnTransformer) {
                    return;
                }

                // find clicked rect by its name
                const name = e.target.name();
                const rect = this.rectangles.find((r) => r.name === name);
                if (rect) {
                    this.selectedShapeName = name;
                } else {
                    this.selectedShapeName = '';
                }
                this.updateTransformer();
            },

            xrClickHandler(evt) {
                if (this.splinemode) {
                    this.handleLabelClick(evt)
                    this.reposition()
                } else this.handleCOBBLineClick(evt)
            },

            xrMoveHandler(evt) {
                if (!this.splinemode) this.handleCOBBMouseMove(evt)
            },

            handleLabelClick(evt) {
                const stage = evt.target.getStage();
                const pos = stage.getPointerPosition();
                const stage_pos_x = stage.x() * -1
                const stage_pos_y = stage.y() * -1
                var pos_x = pos.x / this.zoom + stage_pos_x / this.zoom
                var pos_y = pos.y / this.zoom + stage_pos_y / this.zoom
                var conv_pt = this.imgParams2 ? {
                    x: Math.round(pos_x / this.imgParams2.scalefactor),
                    y: Math.round(pos_y / this.imgParams2.scalefactor)
                } : pos
                this.pointlist.push(conv_pt);
            },


            updateTransformer() {
                // here we need to manually attach or detach Transformer node
                const transformerNode = this.$refs.transformer.getNode();
                const stage = transformerNode.getStage();
                const {selectedShapeName} = this;

                const selectedNode = stage.findOne('.' + selectedShapeName);
                // do nothing if selected node is already attached
                if (selectedNode === transformerNode.node()) {
                    return;
                }

                if (selectedNode) {
                    // attach to another node
                    transformerNode.nodes([selectedNode]);
                } else {
                    // remove transformer
                    transformerNode.nodes([]);
                }
            },
            changeRect: function () {
                const container = this.$refs.container;
                console.log(container)
                if (!container) {
                    return;
                }
                const width = container.offsetWidth;

                this.configKonva.width = width;
                this.configKonva.height = width;
            },

// COBB Label methods
            getCOBBAngles() {
                //find vector components
                if (this.COBBlines.length < 2) return
                this.COBBangles = []
                this.COBBvertebrae = []
                for (let i = 2; i <= this.COBBlines.length; i++) {
                    var A = this.COBBlines[i - 2]
                    var B = this.COBBlines[i - 1]
                    var A1x = A.start[0]
                    var A1y = A.start[1]
                    var A2x = A.end[0]
                    var A2y = A.end[1]
                    var B1x = B.start[0]
                    var B1y = B.start[1]
                    var B2x = B.end[0]
                    var B2y = B.end[1]
                    var dAx = A2x - A1x;
                    var dAy = A2y - A1y;
                    var dBx = B2x - B1x;
                    var dBy = B2y - B1y;
                    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
                    if (angle < 0) {
                        angle = angle * -1;
                    }
                    var degree_angle = Math.round(angle * (180 / Math.PI));
                    var position = [Math.round(Math.abs(B2x - B1x) / 2 + Math.min(B1x, B2x, A1x, A2x)), Math.round(Math.abs(avg([A1y, A2y]) - avg([B1y, B2y])) / 2 + Math.min(B1y, B2y, A1y, A2y))]
                    this.COBBangles.push({position: position, degree: degree_angle})

                    // find the closest circle
                    var avgAy = avg([A1y, A2y])
                    var avgBy = avg([B1y, B2y])
                    var diffsA = this.pointlist.map((x) => Math.abs(x.y - avgAy))
                    var minDiffA = diffsA.indexOf(Math.min(...diffsA))
                    //console.log('Closest circle of line A is: ', minDiffA, ' which is ',this.VERTEBRAE_LABELS[this.vls[0]+minDiffA])

                    var diffsB = this.pointlist.map((x) => Math.abs(x.y - avgBy))
                    var minDiffB = diffsB.indexOf(Math.min(...diffsB))
                    //console.log('Closest circle of line B is: ', minDiffB, ' which is ',this.VERTEBRAE_LABELS[this.vls[0]+minDiffB])

                    this.COBBvertebrae.push([this.VERTEBRAE_LABELS[this.vls[0] + minDiffA], this.VERTEBRAE_LABELS[this.vls[0] + minDiffB]])
                }
            },
            cobbTouchStartHandler(evt) {
                if (this.splinemode) return
                const stage = evt.target.getStage();
                const pos = stage.getPointerPosition();

                const stage_pos_x = stage.x() * -1
                const stage_pos_y = stage.y() * -1
                var pos_x = (pos.x / this.zoom + stage_pos_x / this.zoom) / this.imgParams2.scalefactor
                var pos_y = (pos.y / this.zoom + stage_pos_y / this.zoom) / this.imgParams2.scalefactor

                if (!this.COBBlinedraw) {
                    this.COBBline_temp.start = [pos_x, pos_y]
                    this.COBBline_temp.end = [pos_x, pos_y]
                    this.COBBlines.push(this.COBBline_temp)
                    this.COBBlinedraw = !this.COBBlinedraw
                }
            },


            handleCOBBLineClick(evt) {
                const stage = evt.target.getStage();
                const pos = stage.getPointerPosition();

                const stage_pos_x = stage.x() * -1
                const stage_pos_y = stage.y() * -1
                var pos_x = (pos.x / this.zoom + stage_pos_x / this.zoom) / this.imgParams2.scalefactor
                var pos_y = (pos.y / this.zoom + stage_pos_y / this.zoom) / this.imgParams2.scalefactor
                //var conv_pt=this.imgParams2 ? {x:Math.round(pos_x), y:Math.round(pos_y)} : pos

                //var conv_pt=this.imgParams2 ? {x:Math.round(pos.x/this.imgParams2.scalefactor), y:Math.round(pos.y/this.imgParams2.scalefactor)} : pos

                if (!this.COBBlinedraw) {
                    this.COBBline_temp.start = [pos_x, pos_y]
                    this.COBBline_temp.end = [pos_x, pos_y]
                    this.COBBlines.push(this.COBBline_temp)
                } else {
                    this.COBBline_temp = {}
                    this.COBBlines.sort((a, b) => Math.max(a.start[1], a.end[1]) - Math.max(b.start[1], b.end[1]))
                    this.getCOBBAngles()
                }
                this.COBBlinedraw = !this.COBBlinedraw
            },
            removeLastLine() {
                this.COBBlines.pop()
                this.getCOBBAngles()
            },
            removeAllLines() {
                this.COBBlines = []
                this.COBBangles = []
            },

            handleCOBBMouseMove(evt) {
                if (!this.COBBlinedraw) return
                var lastelement = this.COBBlines.pop()
                var startpos = lastelement.start
                const stage = evt.target.getStage();
                const pos = stage.getPointerPosition();
                const stage_pos_x = stage.x() * -1
                const stage_pos_y = stage.y() * -1
                var pos_x = (pos.x / this.zoom + stage_pos_x / this.zoom) / this.imgParams2.scalefactor
                var pos_y = (pos.y / this.zoom + stage_pos_y / this.zoom) / this.imgParams2.scalefactor

                if (pos_x < startpos[0]) {
                    lastelement.start = [pos_x, pos_y]
                    lastelement.end = startpos
                }
                lastelement.end = [pos_x, pos_y]
                this.COBBlines.push(lastelement)
            },

            // end of COBB methods

            closeImageLabeler() {
                Object.assign(this.$data, initialstate());
                this.$emit('closeImageLabeler', this.ssmitem)
            },
        },

    };
</script>
