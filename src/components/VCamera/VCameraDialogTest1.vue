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

        </v-dialog>
    </v-row>
</template>

<script>

    export default {
        name: 'VcameradialogTest1',


        props: ['label', 'owner', 'program', 'proof_type'],
        data() {
            return {
                dialog: null,
            }
        },
        methods: {

        }
    };
</script>
