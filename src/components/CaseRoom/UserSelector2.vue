<template>
  <v-card
    class="mx-auto"
    max-width="500"
  >
   <v-container
    v-if="selection.length>0">
    <v-card-subtitle>
      Einzuladende Teilnehmer:
    </v-card-subtitle>
    <v-chip-group
      active-class="primary--text"
            column
          >
            <v-chip
              v-for="obj in total_members"
              :key="obj.username"
            >
              {{ obj.name }}
            </v-chip>
    </v-chip-group>
     </v-container>
    <v-sheet class="pa-4 primary lighten-2">
      <v-text-field
        v-model="search"
        label="skoliosekinder.de durchsuchen"
        dark
        flat
        solo-inverted
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-text-field>

    </v-sheet>
    <InviteUser
    v-if="search"
    :name="search"
    label="Teilnehmer nicht gefunden ?"
    @userInvited="onUserInvited">

    </InviteUser>

    <v-card-text>
      <v-treeview
              v-model="selection"
        :items="items"
        :search="search"
        :open.sync="open"
              open-all
              item-key="username"
          item-text="name"
               selectable
                          expand-icon="mdi-chevron-down"
            on-icon="mdi-bookmark"
            off-icon="mdi-bookmark-outline"
            indeterminate-icon="mdi-bookmark-minus"
          return-object
      >
        <template v-slot:prepend="{ item }">
          <v-icon
            v-if="item.children"
            v-text="`mdi-${item.id === 1 ? 'home-variant' : 'folder-network'}`"
          ></v-icon>
        </template>
      </v-treeview>
    </v-card-text>

                    <v-snackbar
      v-model="snackbar"

    >
      {{ snackbar_text }}
                        <template v-slot:action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          OK
        </v-btn>
      </template>
          </v-snackbar>
  </v-card>
</template>

<script>
    import InviteUser from "@/components/CaseRoom/InviteUser";
    export default {
      components: {InviteUser},
      props: {
        },
   mounted() {
       this.selection=[],
        this.members=[],
        this.getUsers();

    },
    data: () => ({
      items: [],
      open: [],
      search: null,
      caseSensitive: false,
      selection:[],
        members:[],
        snackbar: false,
        snackbar_text:"",
    }),
    computed: {
        total_members () {
            return this.selection.concat(this.members)
        }
    },
        watch: {
          total_members: function (newValue,oldValue){
              this.$emit('updateMembers', newValue)
              console.log(oldValue)
          }
        },
    methods: {
          getUsers: function() {
              this.$store.dispatch('caseroom/getDependentChildren')
            .then((response) => {
              if (response.data.length) {
                this.items = [{'name': 'Eigene Kinder', 'children': response.data}]
                var m = response.data.map(x => x.username)
                this.selection.push(m)
              }
              this.$store.dispatch('caseroom/getMedicalUsers')
                      .then((response) => {
                        this.items.push(...response.data);
                      })
            })
          },
        addMember() {
          this.$emit('updateMembers', this.total_members)
        },
         getVal(a) {
             for (var item in this.items) {
                 const f= this.items[item].children.find(child => child.username? child.username === a[0].username : false)
                 if (f) {
                     this.sel =  f
                     console.log(this.sel)
                 }
             }
             // User.document anzeigen lassen
          },
        onUserInvited(payload){
            if (payload.user=='pdf'){
                this.snackbar_text="Du erhältst nun die pdf Datei für "+payload.name+". Schickst Du Sie ihm?"
                this.members.push({'username': 'pdf_'+payload.name, 'name':payload.name})
                 this.selection.push({'username': 'pdf_'+payload.name, 'name':payload.name})
            } else {
                this.snackbar_text="Es wurde eine Email an "+payload.name+" gesendet."
                this.members.push({'username':payload.user.username, 'name':payload.name})
                this.selection.push({'username':payload.user.username, 'name':payload.name})
            }
            this.getUsers()
            this.snackbar=true
        }
    },


    };
</script>
