<template>
    <v-container>
     <v-chip-group
        v-model="selection"
        active-class="deep-purple--text text--accent-4"
        column
      >

        <v-chip
                class="ma-2"
                v-for="parent in caregivers"
                :key="parent.username"
                color="green"
                outlined
        >
            <v-icon>
                mdi-account-child-circle
            </v-icon>
            {{ parent.name }}
                    </v-chip>
     </v-chip-group>

    </v-container>
</template>

<script>


 export default {

     props: {

      },
    data: () => ({
        selection:null,
        caregivers:[],

    }),
      computed: {

        },
      created(){
        this.$store.dispatch('auth/getCaregiver')
          .then((response)=> {
                this.caregivers=response
          }).catch((e)=> {
             console.log(e)
            })
      },
      methods: {
      },

  }

</script>