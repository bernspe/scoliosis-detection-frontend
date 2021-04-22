<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          v-on="on"
        >
          mdi-information-outline
        </v-icon>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          {{ name }}
        </v-card-title>

        <UserProfileDocument :document_url="docurl"></UserProfileDocument>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import UserProfileDocument from "@/components/Documents/UserProfileDocument";
  export default {
    components: {UserProfileDocument},
    props: {
        name: String,
        document_url: String
      },
    data () {
      return {
        dialog: false,
      }
    },
    computed: {
      docurl() {
           return (this.$store.state.endpoints.baseUrl.slice(0,-1)+this.document_url)
        },
    }
  }
</script>
