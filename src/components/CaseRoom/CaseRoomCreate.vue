<template>
        <v-dialog class="CrCreateDialog" v-model="dialog" persistent max-width="600px" min-width="360px">

         <template v-slot:activator="{ on, attrs }">
             <v-fab-transition>
              <v-btn
                fixed
                color="pink"
                dark
                bottom
                right
                fab
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-fab-transition>

         </template>

            <Caseroomcreatecard @CaseRoomCreated="$emit('CaseRoomCreated'); dialog=false"
                                @CaseRoomCreationAborted="dialog=false"></Caseroomcreatecard>
        </v-dialog>
</template>

<script>

    import Caseroomcreatecard from "@/components/CaseRoom/CaseRoomCreateCard";
    export default {
        components: {Caseroomcreatecard},
        data: () => ({
            dialog: false,
        }),

    };
</script>
