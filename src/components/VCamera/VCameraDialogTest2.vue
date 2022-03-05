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
                        large
                        dark
                        v-bind="attrs"
                        v-on="on"
                >
                    <v-icon dark> mdi-camera-outline</v-icon>
                </v-btn>
            </template>

                               <!--
                    start-on-mounted
                    :camera-visible="dialog"
                    -->
            <VCamera

                    @VCameraDone="onCameraDone"
                    :owner="owner"
                    :program="program"
                    :proof_type="proof_type"
            ></VCamera>
        </v-dialog>
    </v-row>
</template>

<script>
    import VCamera from "@/components/VCamera/VCamera";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        name: 'Vcameradialog',
        mixins: [component_tracer],
        components: {VCamera},
        props: ['label', 'owner', 'program', 'proof_type'],
        data() {
            return {
                dialog: null,
            }
        },
        methods: {
            onCameraDone(payload) {
                this.$emit('VCameraDone', payload)
                this.dialog = null
            }
        }
    };
</script>
