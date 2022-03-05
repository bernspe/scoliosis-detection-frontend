<template>
        <v-dialog class="CaseRoomCreateDialog" v-model="dialog" persistent max-width="600px" min-width="360px">

            <Caseroomcreatecard @CaseRoomCreated="$emit('CaseRoomCreated'); dialog=false"
            @CaseRoomCreationAborted="dialog=false"></Caseroomcreatecard>
        </v-dialog>
</template>

<script>

    import Caseroomcreatecard from "@/components/CaseRoom/CaseRoomCreateCard";
    export default {
        components: {Caseroomcreatecard},
        data: () => ({
            dialog: true,
        }),
        watch: {
            dialog: function(val) {
                if (!val) {
                    this.$emit('CaseRoomCreateDialogClosed')
                }
            }
        },
    };
</script>
