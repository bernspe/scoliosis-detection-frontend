<template>

    <v-card
    class="ma-4 my-12"

    :max-width="mini?150:600"
    >

        <AuthImg
            :height="mini?180:250"
            :src="imgurl"
            :auth="getterAuthToken"
            contain
            :cachebreaker="true"
            :activatorfield="mini"
            @activatorclicked="dialog=true"
            @showssmlabeldialog="labeldialog=true"
            :protected="getterSSMProtected(id)"
            :editssm="{...ssm,id:id}"
            :ssmid="id"
        ></AuthImg>

        <v-card-subtitle v-if="mini"> {{ formatDate(ssm.created) }}</v-card-subtitle>

            <SSMItemContent v-if="!mini" :id="id" :ssm="ssm" :deletebtn="deletebtn"></SSMItemContent>

                 <v-dialog
                    v-model="dialog"

                        >
                     <v-card>
                         <v-row dense>
                         <v-col class="mt-6">
                             <AuthImg
                            :height="250"
                            :src="imgurl"
                            :auth="getterAuthToken"
                            contain
                            @showssmlabeldialog="labeldialog=true"
                            :cachebreaker="true"
                            :protected="getterSSMProtected(id)"
                            :editssm="{...ssm,id:id}"
                            :ssmid="id"
                    ></AuthImg>
                             </v-col>
                             </v-row>
                     <SSMItemContent
                             :id="id"
                             :ssm="ssm"
                             closebtn
                             :deletebtn="deletebtn"
                             @closeSSMItemContent="dialog=false"></SSMItemContent>
                     </v-card>
                 </v-dialog>
        <v-dialog
            v-model="labeldialog">
            <ImageLabeler :edititem="ssm" @closeImageLabeler="onImageLabelerClose(ssm.id)"></ImageLabeler>
        </v-dialog>
    </v-card>

</template>

<script>


    import {mapGetters} from "vuex";
    import AuthImg from "@/components/AuthImg";
    import SSMItemContent from "@/components/SSMCenter/SSMItemContent";
    import ImageLabeler from "@/components/ImageLabeler/ImageLabeler";

    export default {
        components: {AuthImg,SSMItemContent, ImageLabeler},

        data: ()=> {
            return {
                dialog: false,
                labeldialog:false,
            }
        },

        computed: {
            ...mapGetters(['getterAuthToken']),
            ...mapGetters('imagecenter',['getterSSMProtected','getterAllEntries']),

            imgurl() {
                var thumb = Object.prototype.hasOwnProperty.call(this.ssm,'thumb_img') ? this.ssm.thumb_img : ''
                var resized = Object.prototype.hasOwnProperty.call(this.ssm,'resized_img') ? this.ssm.resized_img : ''
                return thumb.includes('default') ? resized.includes('default') ? this.ssm.img : this.ssm.resized_img : this.ssm.thumb_img
            },
            ssm() {
                return {...this.getterAllEntries[this.id],id:this.id}
            },

        },

        methods: {
            onImageLabelerClose: function(payload) {
                this.$store.dispatch('imagecenter/updateSSM',{'id': payload,'locked': false})
                this.labeldialog=false
            },
             formatDate (date) {
                const [year, month, day] = date.split(/-|T/)
                return (day + '.' + month + '.' + year)
            },
        },

        props: {
            deletebtn: Boolean,
            mini: Boolean,

            id: String,
        },
    };
</script>

