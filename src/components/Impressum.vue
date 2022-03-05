<template>

    <v-container fluid>
        <v-row>
            <v-col mdAndUp="6" smAndDown="12">
                <v-card>
                    <v-img src="../assets/skolioselogo.png"
                           class="white--text align-end"
                           height="100"
                           contain
                           data-cy="skolioselogo"
                    ></v-img>

                    <v-card-title>Das Programm</v-card-title>
                    <v-card-subtitle>Wir verwenden keine Cookies. In Deinem Browser wird ein Token gespeichert, der
                        gelöscht wird, sobald Du Dich ausloggst. Ausserdem werden die Versionsnummern der Software
                        gespeichert.
                    </v-card-subtitle>
                    <v-card-text>
                        <v-chip class="ma-2 pa-4" x-large outlined data-cy="frontend_version">Frontend Version: {{ getterFrontendVersion }} <br>
                            Build: {{ getterFrontendDate }}
                        </v-chip>
                        <v-chip class="ma-2 pa-4" x-large outlined data-cy="backend_version">Backend Version: {{ getterBackendVersion }} <br>
                            Build: {{ getterBackendDate }}
                        </v-chip>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="success" @click="showconsentform=true">Wissenswertes zum Datenschutz</v-btn>
                    </v-card-actions>

                    <ConsentForm
                        v-if="showconsentform"
                        consent_type="P0"
                        omit-buttons
                        >
                        </ConsentForm>
                </v-card>
            </v-col>
            <v-col mdAndUp="6" smAndDown="12">
                <v-card>
                    <v-card-title>Entwickler</v-card-title>
                    <v-list v-for="item in items" :key="item.name">
                        <v-list-item three-line>
                            <v-list-item-avatar>
                                <v-img :src="item.avatar"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                <v-list-item-subtitle> {{ item.work }}</v-list-item-subtitle>
                                <v-list-item-subtitle>Verantwortlich für {{ item.responsible }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <a :href="`mailto:${item.email}`">
                                    <v-icon>mdi-email</v-icon>
                                </a>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import {mapGetters} from "vuex";
    import component_tracer from "@/mixins/component_tracer";
    import ConsentForm from "@/components/ConsentForm/ConsentForm";

    export default {
        name: "impressum",
        components: {ConsentForm},
        mixins: [component_tracer],

        methods: {},
        data() {
            return {
                showconsentform: false,
                items: [
                    {
                        name: 'Peter Bernstein',
                        work: 'Orthopäde, Hobby-Softwareentwickler',
                        responsible: 'Datenschutz, Frontend & Backend',
                        email: 'bernspe@gmail.com',
                        avatar: 'https://www.johannesbad-medizin.com/fileadmin/_processed_/b/a/csm_PD_Dr._Bernstein___Auswahl_a4e72a8211.jpg'
                    }
                ]
            }
        },
        computed: {

            ...mapGetters(["getterFrontendVersion", "getterBackendVersion", "getterFrontendDate", "getterBackendDate"])
        }
    };
</script>