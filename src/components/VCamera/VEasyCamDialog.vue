<template>
   <v-row justify="center">
        <v-dialog
                v-model="dialog"
                transition="dialog-bottom-transition"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                        color="primary"
                        fab
                        v-bind="attrs"
                        v-on="on"
                >
                    <v-icon dark> mdi-plus</v-icon>
                </v-btn>
            </template>

           <EasyCamera v-if="dialog"
                   v-model="picture"
                    fullscreen
                   mustApprove
                   @close="finish"
           ></EasyCamera>
        </v-dialog>
    </v-row>
</template>


<script>
 import EasyCamera from 'easy-vue-camera';

    export default {
        components: {EasyCamera},
        props: ['index'],
        name: 'Veasycamdialog',
        data() {
            return {
                dialog: false,
                picture:null,
            }
        },
        watch: {
            picture: function(val) {
                if (val) {
                    this.$store.commit('imagecenter/setCameraPicture', {index:this.index, item:this.picture})
                    this.dialog=false
                }
            }
        },
        methods: {
            finish ()  {
                this.dialog=false
            }
        }
    };
</script>
