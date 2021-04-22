<template>
  <v-card>
    <v-card-title class="indigo white--text headline">
      Benutzerauswahl
    </v-card-title>
    <v-row
      class="pa-4"
      justify="space-between"
    >
      <v-col cols="6">
        <v-treeview
                v-model="selection"
                selection-type="leaf"
                :active.sync="active"
          :items="roleitems"
          item-key="username"
          item-text="name"
          activatable
          color="warning"
                dense
          open-on-click
          transition
                selectable
          return-object
                @update:active="getVal"
                @input="addMember"
        >
        </v-treeview>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col
        class="d-flex text-center"
      >
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="!sel"
            class="title grey--text text--lighten-1 font-weight-light"
            style="align-self: center;"
          >
            Wähle aus...
          </div>
          <v-card
            v-else
            :key="sel.username"
            class="pt-6 mx-auto"
            flat
            max-width="400"
          >
            <v-card-text>
              <h3 class="headline mb-2">
                {{ sel.name }}
              </h3>
            </v-card-text>
            <v-divider></v-divider>

          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>


  import {MEDROLES} from "@/store/modules/auth";

  export default {
    data: () => ({
        active: [],
        items:[],
        sel:null,
        selection: [],
    }),
    computed: {
       roleitems() {
         var result=this.items.map(item => {
           var ritem=item;
           if (item.name != 'Kinder') {
             ritem.name=MEDROLES[item.name]
           }
           return ritem;
         });
         return result
       }
    },
    mounted() {
            this.$store.dispatch('caseroom/getDependentChildren')
            .then((response) => {
              if (response.data.length) {
                this.items = [{'name': 'Kinder', 'children': response.data}]
                var m = response.data.map(x => x.username)
                this.selection.push(m)
              }
              this.$store.dispatch('caseroom/getMedicalStaff')
                      .then((response) => {
                        //Deutsche Übersetzung erforderlich
                        this.items.push(...response.data);
                      })
            })

    },

    methods: {
        addMember() {
          this.$emit('updateMembers', this.selection)           
        },
         getVal(a) {
             for (var item in this.items) {
                 const f= this.items[item].children.find(child => child.username === a[0].username)
                 if (f) {
                     this.sel =  f
                 }
             }
             // User.document anzeigen lassen
          },
    },
  }
</script>

