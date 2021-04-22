<template>

     <v-chip
         v-if="!mutate"
         color="orange"> {{getNameFromRoleValue(selection)}}
     </v-chip>
      <v-treeview
              v-else-if="mutate"
            rounded
            hoverable
            activatable
              open-on-click
            return-object
            :items="getterRolesTree"
            @update:active="getVal"
  ></v-treeview>

</template>


<script>

  import {mapGetters} from "vuex";

  export default {
      props: {
          mutate:Boolean,
          value:String,
      },
    data: () => ({
        selection:null,
    }),
      computed: {
          ...mapGetters("auth",['getterRolesTree','getNameFromRoleValue'])
      },
      methods: {
            getVal(a) {
               this.selection=a[0].value
                // Fire back results to parent
                this.$emit('updateRole',{mutate: !this.mutate, value: a[0].value})
            }
      },
      mounted(){
        this.selection=this.value;
      }
  }
</script>