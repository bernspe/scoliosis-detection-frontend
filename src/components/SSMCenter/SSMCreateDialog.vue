<template>
        <v-dialog class="SSMCreateDialog" v-model="dialog" max-width="500px">
            <SSMCreate :owner="owner" @ssmcreated="atSSMCreated" @SSMCreationAborted="dialog=false"></SSMCreate>
        </v-dialog>
</template>

<script>

    import SSMCreate from "@/components/SSMCenter/SSMCreate";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        components: {SSMCreate},
        name:'SSMCreateDialog',
        mixins: [component_tracer],
        props: {owner: String,

        },
        data: () => ({
            dialog: true,
        }),

        methods: {
          atSSMCreated() {
              this.$emit('ssmcreated')
              this.dialog=false
          },
        },
        watch: {
            dialog: function(val) {
                if (!val) {
                    this.$emit('SSMCreateDialogClosed')
                }
            }
        },
    };
</script>
