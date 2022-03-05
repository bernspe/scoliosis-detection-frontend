<template>
    <div class="UserSelector3">

        <v-autocomplete
                v-model="model"
                :items="items"
                :loading="isLoading"
                :search-input.sync="search"
                hide-no-data
                menu-props="closeOnContentClick"
                label="Bitte gib Vorname Nachname Geburtsdatum oder email ein:"
                return-object
                :append-outer-icon="notfound ? 'mdi-account-search-outline' : ''"
                @input="userselected"
                @click:append-outer="searchuser"
                @keydown.enter="searchuser"
                id="us3inputfield"
        >

        </v-autocomplete>

    </div>
</template>

<script>
import {mapGetters} from "vuex";
import component_tracer from "@/mixins/component_tracer";

require('datejs');
Date.i18n.setLanguage('de-DE');

    export default {
        name: 'Userselector3',
        mixins: [component_tracer],
        data: () => ({
          model:null,
            entries_a: [],
            initial_entries_length:0,
            found: false,
            isLoading: false,
            search: null,
            firstname:null,
            lastname: null,
            birthday_date: null,
            email: null
        }),
        computed: {
            ...mapGetters('auth',['getterDependentChildren','getterMyPatients','isCaregiver','isMed']),
              items () {
                if (this.entries.length>0) {
                    return this.entries.map(entry => {
                        return Object.assign({}, {value: entry},
                            {text: entry.name + ' ' + Date.parse(entry.date_of_birth).toString('d.M.yyyy') + ' (' + entry.email + ')'})
                    })
                } else return []
              },
                notfound () {
                  return (!this.found) && (!this.model) && (((this.firstname!=null) && (this.lastname!=null) && (this.birthday_date!=null)) || (this.email!=null))
                },
            entries: {
                get() {
                    if (!this.search){
                        if (this.isMed) return this.getterMyPatients
                        if (this.isCaregiver) return this.getterDependentChildren
                    }
                    return this.entries_a
                },
                set(val) {
                    this.entries_a = val
                }
            }
        },
        methods: {
            getBaseEntries: function() {
                this.initial_entries_length=this.entries.length
                this.found= false
                this.firstname=null
                this.lastname=null
                this.email=null
                this.birthday_date=null
            },
            userselected: function(payload) {
                this.$emit('userselected',payload.value)
            },
            searchuser: function() {
                this.isLoading = true
                var first_name=this.firstname
                var last_name=this.lastname
                var birthday_date=this.birthday_date
                var bd_formatted = birthday_date ? Date.parse(birthday_date).toString('yyyy-MM-dd') : null
                var email=this.email
                const payload= email ? {'email':email} : {'first_name': first_name, 'last_name': last_name, 'birthday_date': bd_formatted}
                this.$store.dispatch('auth/searchUser',payload)
                .then((res) => {
                    if (res.length>0) this.found=true
                    this.entries=res
                })
                .finally(() => this.isLoading = false)

            },
        },
        mounted () {
         //  this.getBaseEntries();
         //   this.search=null
        },
        watch: {
            search (val) {
                // Items have already been requested
                if (this.isLoading) return
                this.model=null
                this.getBaseEntries()
                // extract either email or combination from Name and Birthday
                var re_date=/(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/gm
                var re_email=/\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+/gm

                var birthday_date = val ? val.match(re_date) ? val.match(re_date)[0] : null :null
                var bd_formatted = birthday_date ? Date.parse(birthday_date).toString('yyyy-MM-dd') : null

                var email = val ? val.match(re_email) ? val.match(re_email)[0] : null : null
                var val_email_extracted = email ? val.replace(re_email,'') : null
                val = val_email_extracted ? val_email_extracted : val

                var val_date_extracted = birthday_date ? val.replace(re_date,'') : null
                var name = val_date_extracted ? val_date_extracted.split(' ') : null
                var first_name = name ? name[0] : null
                var last_name = name ? name.length>1 ? name.slice(1).join(' ') : null : null
                //console.log('First: ',first_name,' Last: ',last_name,' Birthday: ',birthday_date,' EMail: ',email)
                // non valid input
                if (!((birthday_date) || (name) || (email))) return

                // Items have already been loaded
                if (this.items.length > this.initial_entries_length) return

                // Lazily load input items
                this.firstname=first_name
                this.lastname=last_name
                this.birthday_date=bd_formatted
                this.email=email
            },

            notfound (val) {
                if (val) {
                    this.$store.commit('userfindinvite/setUserToInvite',{'firstname': this.firstname, 'lastname': this.lastname,'name': this.firstname+' '+this.lastname, 'email': this.email, 'birthday_date': this.birthday_date})
                }
            }
    },
    };
</script>
