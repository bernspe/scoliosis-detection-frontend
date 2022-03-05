<template>
        <v-row>
            <v-col
            cols="12">
                    <v-data-table
                            v-model="selected_user"
                            :headers="headers"
                      :items="users"
                      item-key="username"
                      class="elevation-1"
                      :search="search"
                      :custom-filter="filterOnlyCapsText"
                      single-expand
                        :expanded.sync="expanded"
                      show-expand
                      show-select
                      @item-selected="userselected"
                    >
                      <template v-slot:top>
                        <v-text-field
                          v-model="search"
                          label="Suche nach Medizinern"
                          class="mx-4"
                          append-outer-icon="mdi-account-plus"
                        ></v-text-field>
                      </template>
                        <template v-slot:expanded-item="{ headers, item }">
                        <td :colspan="headers.length">
                            <UserProfileDocument
                                :document_url="docurl(item.document)"
                                :mutable="false"
                            >
                            </UserProfileDocument>
                      </td>
                    </template>
                    </v-data-table>
            </v-col>
        </v-row>

</template>

<script>
    import {mapState} from "vuex";
    import UserProfileDocument from "@/components/Documents/UserProfileDocument";
    import component_tracer from "@/mixins/component_tracer";

    export default {
        name: 'Userselector4',
        mixins: [component_tracer],
        components: { UserProfileDocument},
        data () {
            return {
                selected_user: [],
                width: 50,
                expanded: [],
                search: '',
            }
        },
        computed: {
            ...mapState('auth',['userroles']),

            headers () {
                return [
                  {
                    text: 'Vorname',
                    align: 'start',
                    sortable: false,
                      value: 'first_name'
                  },
                  {
                    text: 'Nachname',
                    sortable: true,
                    value: 'last_name',
                  },

                  { text: 'eMail', value: 'email',sortable: true },
                    { text: 'Rollen', value: 'roles',sortable: true },
                    { text: 'Adresse', value: 'postal_address',sortable: true}
                ]
              },
        },
        asyncComputed: {
          users: {
            get() {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.$store.dispatch('auth/getMedUsers')
                        .then((res) => {
                            resolve(res.map((x) => Object.assign(x,{'roles': x.roles.map((r) => this.userroles[r]).join(', ')})))
                        }).catch((e) => reject(e))
                    }, 1000)
                })
            },
            default: [],
          },
        },
        methods: {
            docurl: function(url) {
             return (this.$store.state.endpoints.baseUrl.slice(0,-1)+url)
            },
            filterOnlyCapsText (value, search) {
                return value != null &&
                  search != null &&
                  typeof value === 'string' &&
                  value.toString().toLocaleLowerCase().indexOf(search) !== -1
              },
            userselected: function(payload) {
                if (payload.value) this.$emit('userselected',payload.item)
                else this.$emit('userunselected',payload.item.username)
            },
        },
        mounted () {
          //this.$store.dispatch('auth/getUserRolesDict')
        },
    };
</script>
