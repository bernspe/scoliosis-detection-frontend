<template>
    <v-container class="ImageCenter"
                 justify="center">
        <v-row dense>
            <v-col>
                <v-progress-linear
                        indeterminate
                        color="cyan"
                        v-if="ssm_loading"
                ></v-progress-linear>
            </v-col>
            <v-spacer></v-spacer>
            <v-col>
                <v-switch
                        v-model="date_order"
                        false-value="absteigend"
                        true-value="aufsteigend"
                        :label="`Datum: ${date_order.toString()}`">
                </v-switch>
            </v-col>
        </v-row>
        <!-- User is child, adult or individual patient -->
        <v-container fluid v-if="(isAdult||isChild) && (!isStaff) && (!isCaregiver)"
        >
            <v-row dense>
                <v-col v-for="entry in getterAllEntriesAsArray.sort(date_order === 'aufsteigend' ? sort_function_asc : sort_function_desc)"
                       :key="entry.id">
                    <SSMItem class="tracer_ssmcenter_patient" mini deletebtn :ssm="entry" :id="entry.id"
                             @ssmdeleted="loadSSMs"></SSMItem>
                </v-col>
            </v-row>

            <SSMCreateDialog @ssmcreated="loadSSMs" v-if="start_ssmcreate"
                             @SSMCreateDialogClosed="start_ssmcreate=false"></SSMCreateDialog>

            <Veasycampanel v-if="start_ssmcamera" @CamPanelClosed="start_ssmcamera=false"></Veasycampanel>
            <!--
            <v-dialog class="SSMCameraDialog" v-model="start_ssmcamera" persistent max-width="600px" min-width="360px">
                <VCamera
                        start-on-mounted
                        @VCameraDone="start_ssmcamera=null"
                ></VCamera>
            </v-dialog>
-->
        </v-container>

        <!-- User is Caregiver or MedProfessional -->
        <v-container v-if="isMed || isCaregiver">

            <v-data-table
                    :headers="headers_med"
                    :items="items_med_caregiver"
                    item-key="username"
                    class="elevation-1 tracer_ssmcenter_med"
                    single-expand
                    :expanded.sync="expanded_med"
                    show-expand
                    :search="search"
            >
                <template v-slot:top v-if="isMed">
                    <v-text-field
                            v-model="search"
                            label="In meinen Patienten suchen"
                            class="mx-4"
                    ></v-text-field>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length">
                        <v-sheet
                                class="mx-auto"
                                elevation="8"

                        >
                            <v-row dense>
                                <v-col
                                        v-for="entry in getEntriesByUser(item.username).sort(date_order === 'aufsteigend' ? sort_function_asc : sort_function_desc)"
                                        :key="entry.id" class="ma-2"
                                >
                                    <SSMItem deletebtn mini :ssm="entry" :id="entry.id"
                                             @ssmdeleted="loadSSMs"></SSMItem>
                                </v-col>
                            </v-row>
                        </v-sheet>
                    </td>

                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                            small
                            class="mr-2 tracer_file_upload"
                            @click="start_ssmcreate=item.username"
                    >
                        mdi-upload-outline
                    </v-icon>
                    <v-icon
                            small
                            class="mr-2 tracer_camera_start"
                            @click="start_ssmcamera=item.username; start_ssmcamera_dialog=true"
                    >
                        mdi-camera-plus-outline
                    </v-icon>

                </template>
            </v-data-table>
            <SSMCreateDialog :owner="start_ssmcreate" @ssmcreated="loadSSMs" v-if="start_ssmcreate"
                             @SSMCreateDialogClosed="start_ssmcreate=null"></SSMCreateDialog>

             <Veasycampanel v-if="start_ssmcamera" :owner="start_ssmcamera" @CamPanelClosed="start_ssmcamera=null; start_ssmcamera_dialog=false"></Veasycampanel>

            <!--
            <v-dialog class="SSMCameraDialog" v-model="start_ssmcamera_dialog" persistent max-width="600px"
                      min-width="360px">
                <VCamera
                        v-if="start_ssmcamera"
                        start-on-mounted
                        :owner="start_ssmcamera"
                        @VCameraDone="start_ssmcamera=null; start_ssmcamera_dialog=false"
                ></VCamera>
            </v-dialog> -->
        </v-container>

        <!-- if User is Staff Member -->

        <v-container v-if="isStaff">
            <v-data-table
                    :mobile-breakpoint="0"
                    :headers="headers_staff"
                    :items="getterAllEntriesAsArray"
                    item-key="id"
                    class="elevation-1 tracer_ssmcenter_staff"
                    :search="search"
                    single-expand
                    :expanded.sync="expanded_staff"
                    show-expand
                    @item-expanded="toggleLockPre"
            >
                <template v-slot:top>
                    <v-text-field
                            v-model="search"
                            label="In allen Aufnahmen suchen"
                            class="mx-4"
                    ></v-text-field>
                </template>

                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length">
                        <v-sheet>

                            <ImageLabeler :edititem="item"
                                          @closeImageLabeler="onImageLabelerClose(item.id)"></ImageLabeler>

                        </v-sheet>
                    </td>
                </template>

                <template v-slot:item.type="{ item }">
                    <v-select
                            :items="getterTypeLabels"
                            v-model="item.type"
                            @change="changeType(item,item.type)">
                    </v-select>
                </template>
                <template v-slot:item.results="{ item }">
                    <v-icon
                            small
                            class="mr-2"
                            v-if="item.hasResult ? item.hasResult.includes('1') : false"
                            color="green"
                    >
                        mdi-check
                    </v-icon>
                    <v-icon
                            small
                            class="mr-2"
                            v-if="item.hasResult ? item.hasResult.includes('2') : false"
                            color="green"
                    >
                        mdi-check-all
                    </v-icon>
                    <v-icon
                            small
                            class="mr-2"
                            v-if="item.hasResult ? item.hasResult.includes('3') : false"
                            color="green"
                    >
                        mdi-shield-check-outline
                    </v-icon>
                </template>
                <template v-slot:item.locked="{ item }">
                    <v-icon
                            small
                            class="mr-2"
                            v-if="item.locked"
                            color="red"
                            @click="toggleLock(item)">
                        mdi-lock
                    </v-icon>
                    <v-icon
                            small
                            class="mr-2"
                            v-else
                            color="green"
                            @click="toggleLock(item)">
                        mdi-lock-open-variant
                    </v-icon>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-icon
                            small
                            class="mr-2"
                            @click="showitem=item"
                    >
                        mdi-eye-check-outline
                    </v-icon>

                    <v-icon
                            small
                            class="mr-2"
                            @click="deleteSSM({id:item.id})"
                            color="red"
                    >
                        mdi-trash-can-outline
                    </v-icon>
                </template>
            </v-data-table>

            <v-card v-if="showitem">
                <v-card-title>{{ showitem.owner_fullname }}</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="3">
                            <v-card-subtitle>Original</v-card-subtitle>
                            <AuthImg
                                    lazy-src="../../assets/s_logo.png"
                                    :src="showitem.img"
                                    :auth="getterAuthToken"
                                    contain
                                    height="300"

                            >
                            </AuthImg>
                        </v-col>

                        <v-col cols="3">
                            <v-card-subtitle>Cropped / Resized</v-card-subtitle>
                            <AuthImg
                                    lazy-src="../../assets/s_logo.png"
                                    :src="showitem.resized_img"
                                    :auth="getterAuthToken"
                                    contain
                                    height="300"
                                    :cachebreaker="true"
                                    :protected="getterSSMProtected(showitem.id)"
                            >
                            </AuthImg>
                        </v-col>
                        <v-col cols="3">
                            <v-card-subtitle>ML Algo Modified</v-card-subtitle>
                            <AuthImg
                                    lazy-src="../../assets/s_logo.png"
                                    :src="showitem.modified_img"
                                    :auth="getterAuthToken"
                                    contain
                                    height="300"
                                    :cachebreaker="true"
                                    :protected="getterSSMProtected(showitem.id)"
                            >
                            </AuthImg>
                        </v-col>

                        <v-col cols="3">
                            <v-card-subtitle>Manually labeled</v-card-subtitle>
                            <AuthImg
                                    lazy-src="../../assets/s_logo.png"
                                    :src="showitem.man_labeled_img"
                                    :auth="getterAuthToken"
                                    contain
                                    height="300"
                                    :cachebreaker="true"
                                    :protected="getterSSMProtected(showitem.id)"
                            >
                            </AuthImg>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-combobox
                            :items="PROCESS_STATUS_LABELS"
                            v-model="process_select"
                            label="Revoke to ...">

                    </v-combobox>
                    <v-btn
                            class="ma-2"
                            outlined
                            color="red"
                            @click="revokeItem(showitem, process_select)"
                    >
                        Revoke SSM Item
                    </v-btn>

                    <v-btn
                            class="ma-2"
                            outlined
                            color="green"
                            @click="validateItem(showitem)"
                    >
                        Validate SSM Item
                    </v-btn>


                    <v-btn
                            class="ma-2"
                            outlined
                            color="green"
                            @click="addToCollection(showitem)"
                    >
                        Add SSM To Collection
                    </v-btn>

                    <v-btn
                            class="ma-2"
                            outlined
                            color="purple"
                            @click="protectItem(showitem)"
                    >
                        Protect SSM Item
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-container>

        <v-speed-dial v-if="isChild || isAdult || isPatient"
                id="tracer_ssmcenter_add"
                v-model="fab"
                absolute
                top
                left
                direction="bottom"
                transition="slide-y-transition"
        >
            <template v-slot:activator>
                <v-btn
                        v-model="fab"
                        color="blue darken-2"
                        dark
                        fab
                >
                    <v-icon v-if="fab">
                        mdi-close
                    </v-icon>
                    <v-icon v-else>
                        mdi-plus
                    </v-icon>
                </v-btn>
            </template>


            <v-btn
                   fab
                   small
                   dark
                   color="indigo"
                   @click.stop="start_ssmcreate=true"
            >
                <v-icon>mdi-file-upload-outline</v-icon>
            </v-btn>

            <v-btn
                   fab
                   small
                   dark
                   color="indigo"
                   @click.stop="start_ssmcamera=true"
            >
                <v-icon>mdi-camera</v-icon>
            </v-btn>
        </v-speed-dial>

        <v-tour name="ssmcenterTour" :steps="tourSteps" :options="tourOptions"></v-tour>
    </v-container>

</template>

<script>


    import {mapActions, mapGetters} from "vuex";
    import SSMItem from "@/components/SSMCenter/SSMItem";
    import SSMCreateDialog from "@/components/SSMCenter/SSMCreateDialog";
    import AuthImg from "@/components/AuthImg";
    import ImageLabeler from "@/components/ImageLabeler/ImageLabeler";
    import component_tracer from "@/mixins/component_tracer";
    import Veasycampanel from "@/components/VCamera/VEasyCamPanel";

    function formatDate(date) {
        const [year, month, day] = date.split(/-|T/)
        return (day + '.' + month + '.' + year)
    }

    export default {
        components: {Veasycampanel, AuthImg, SSMCreateDialog, SSMItem, ImageLabeler},
        name: 'ssmcenter',
        mixins: [component_tracer],
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname', 'isChild', 'isAdult', 'isPatient', 'isCaregiver', 'isMed', 'isStaff', 'getterDependentChildren', 'getterMyPatients']),
            ...mapGetters("imagecenter", ['getterAllEntries', 'getterAllEntriesAsArray', 'getterSSMProtected', 'getterTypeLabels']),
            ...mapGetters("caseroom", ["getParticipantsChildrenNAdultsNPatients"]),
            ...mapGetters(['getterAuthToken']),

            isProtected(id) {
                return this.getterSSMProtected(id)
            },
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
                    {text: 'Actions', value: 'actions', sortable: false},
                ]
            },

            headers_staff() {
                return [
                    {
                        text: 'Name',
                        align: 'start',
                        sortable: true,
                        value: 'owner_fullname'
                    },
                    {
                        text: 'Geburtsdatum',
                        sortable: true,
                        value: 'owner_birthday',
                    },

                    {text: 'Title', value: 'title'},
                    {text: 'Status', value: 'status'},
                    {text: 'Type', value: 'type'},
                    {text: 'Results', value: 'results', sortable: true},
                    {text: 'Locked', value: 'locked'},
                    {text: 'Actions', value: 'actions', sortable: false},
                ]
            },
            items_med_caregiver() {
                let it = this.isMed ? this.getterMyPatients : this.isCaregiver ? this.getterDependentChildren : null
                let res = []
                if (it) {
                    res = it.map((x) => {
                        return {
                            ...x,
                            bd_formatted: x.date_of_birth ? formatDate(x.date_of_birth) : null
                        }

                    })
                }
                return res
            },
        },
        mounted() {
            if (this.isMed) this.$store.dispatch('auth/getMyPatients')
            if (this.isCaregiver) this.$store.dispatch('auth/getDependentChildren')
            this.loadSSMs();
        },
        methods: {
            ...mapActions("imagecenter", ["deleteSSM"]),
            sort_function_asc: (a, b) => new Date(a.created) - new Date(b.created),
            sort_function_desc: (a, b) => new Date(b.created) - new Date(a.created),

            getColorFromCheckedStatus(item) {
                if (item.checkedby) {
                    return 'green'
                } else {
                    return 'red'
                }
            },
            loadSSMs: function () {
                this.ssm_loading = true
                this.$store.dispatch('imagecenter/getssm_user_list')
                    .finally(() => this.ssm_loading = false)
            },
            getEntriesByUser: function (username) {
                if (username && this.getterAllEntriesAsArray) {
                    const subarray = this.getterAllEntriesAsArray
                    let subObj = subarray.filter((x) => x.owner_username === username)
                    return subObj
                }
            },

            changeType: function (item, typeselect) {
                this.$store.dispatch('imagecenter/updateSSM', {id: item.id, type: typeselect})

            },
            revokeItem: function (item, process_select) {
                this.$store.dispatch('imagecenter/updateSSM', {id: item.id, status: process_select})
            },
            validateItem: function (item) {
                this.$store.dispatch('imagecenter/validateSSM', item)
            },
            addToCollection: function (item) {
                this.$store.dispatch('imagecenter/addSSMtoCollection', item)
            },
            protectItem: function (item) {
                this.$store.dispatch('imagecenter/protectSSM', item)

            },
            toggleLock: function (item) {
                this.$store.dispatch('imagecenter/updateSSM', {'id': item.id, 'locked': !item.locked})
            },
            toggleLockPre: function (payload) {
                this.$store.dispatch('imagecenter/updateSSM', {'id': payload.item.id, 'locked': payload.value})

            },
            onImageLabelerClose: function (payload) {
                this.expanded_staff = []
                this.$store.dispatch('imagecenter/updateSSM', {'id': payload, 'locked': false})
            },
        },
        data: () => ({
            date_order: "aufsteigend",
            fab: false,
            start_ssmsequence: false,
            start_ssmcreate: null,
            start_ssmcamera: null,
            start_ssmcamera_dialog: false,
            start_caseroomcreate: false,
            ssm_loading: false,
            showitem: null,
            edititem: null,
            ssm_model: null,
            expanded_med: [],
            expanded_staff: [],
            search: '',
            process_select: null,
            PROCESS_STATUS_LABELS: ['UPLOADED', 'CROP_LEVEL1', 'CLASSIFY_LEVEL1', 'CLASSIFY_LEVEL2', 'MEASURE_LEVEL1', 'MEASURE_LEVEL2', 'MEASURE_LEVEL3'],

        }),
        props: {},
    };
</script>

