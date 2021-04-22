<template>

  <v-container fluid>
      <v-row>
      <v-col mdAndUp="6" smAndDown="12">
      <v-card>
          <v-img src="../assets/skolioselogo.png"
          class="white--text align-end"
          height="100"
                 contain
          ></v-img>

          <v-card-title>Das Programm</v-card-title>
          <v-card-subtitle>Wir verwenden keine Cookies. In Deinem Browser wird ein Token gespeichert, der gelöscht wird, sobald Du Dich ausloggst. Ausserdem werden die Versionsnummern der Software gespeichert.</v-card-subtitle>
          <v-card-text>
              <v-chip  x-large outlined>Frontend Version: {{ getterFrontendVersion }} <br> Build: {{ getterFrontendDate }}</v-chip>
              <v-chip x-large outlined>Backend Version: {{ getterBackendVersion }} <br> Build: {{ getterBackendDate }}</v-chip>
          </v-card-text>

          <v-card-title>Die Bibliotheken</v-card-title>
          <v-card-subtitle>Django Rest Framework, Vue, Vuetify und viele mehr... (needs to be completed)</v-card-subtitle>
      </v-card>
   </v-col>
      <v-col mdAndUp="6" smAndDown="12">
      <v-card>
          <v-card-title>Die Entwickler</v-card-title>
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

    export default {
  name: "impressum",

      methods: {

      },
    data () {
      return {
          items: [
              {name: 'Peter Bernstein',
              work: 'Orthopäde, Hobby-Softwareentwickler',
              responsible: 'Datenschutz, Frontend & Backend',
              email: 'bernspe@gmail.com',
              avatar: 'https://www.johannesbad-medizin.com/fileadmin/_processed_/b/a/csm_PD_Dr._Bernstein___Auswahl_a4e72a8211.jpg'},
              {name: 'Markus Wacker',
              work: 'Professor für Computergrafik',
              responsible: 'inhaltliche Kontinuität und Vernetzung',
              email: 'markus.wacker@htw-dresden.de',
              avatar: 'https://www.htw-dresden.de/uploads/tx_xmhtwpeople/Frontend-Nutzer-Bilder/_processed_/1/5/csm_wacker_5e35aee2e6075_09dac5edda.jpg'},
              {name: 'Johannes Metzler',
              work: 'Dipl.-Ing. für Informatik',
              responsible: 'Machine Learning',
              email: 'johannes.metzler@htw-dresden.de',
              avatar: 'http://www.drematrix.de/media/uploads/images/staff/20191111_ag-drematrix-069.jpeg'}
          ]
      }
    },
  computed: {

    ...mapGetters(["getterFrontendVersion","getterBackendVersion","getterFrontendDate","getterBackendDate"])
  }
    };
</script>