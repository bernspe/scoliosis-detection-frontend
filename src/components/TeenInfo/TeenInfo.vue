<template>


        <v-row>
            <v-col cols="4">
                <v-card
                class="d-flex align-center"
                fixed
                flat
                >
                <v-img
                src="../IntroTour/scoliosis_back3_large.png"

              >
                </v-img>
                </v-card>
            </v-col>
            <v-col cols="8">
                <h1>Skoliose ist gefährlich</h1>
                <h2>Dem stimme ich zu
                <v-rating v-model="data_quant.rating_danger"
                  hover
                  length="5"
                  size="24"
                ></v-rating></h2>
                <div v-if="data_quant.rating_danger>0">
                <h2>Ich finde es wichtig, sich mit dem Thema Skoliose zu beschäftigen
                <v-rating v-model="data_quant.rating_importance"
                  hover
                  length="5"
                  size="24"
                ></v-rating></h2>
                </div>
                <template v-if="data_quant.rating_importance > 1">
                    <p>Zunächst ist die Skoliose eine eher harmlose Verformung der Wirbelsäule, die bei 3% aller Menschen zu finden ist. Der Betroffene selbst merkt das meist gar nicht. Manchmal wird es erst von anderen bemerkt, dass eine Schulter schief sei oder dass man irgendwie im wahrsten Sinn des Wortes neben sich stehen würde. Wenn andere die Skoliose allerdings erst einmal von außen sehen, dann ist sie meist soweit fortgeschritten, dass man nur noch mit einer Operation helfen kann.</p>
                    <v-checkbox
                      v-model="data_cat.scoliosispatient"
                      label="Ich habe Skoliose"
                      color="info"
                      hide-details
                    ></v-checkbox>
                    <v-btn
                      text
                      color="primary"
                      @click="cont1"
                    >
                      Weiterlesen
                    </v-btn>
                    <v-divider></v-divider>
                    <h2>Also ist die Skoliose doch gefährlich?</h2>
                    <div ref="cont1_text"></div>
                    <div v-if="cont1_set && !date">
                        <p>Die skoliotische Verformung der Wirbelsäule tritt meistens erst dann auf, wenn Kinder zu Jugendlichen werden. Bestimmt hast Du schon einmal gehört, dass es Wachstumsschübe gibt. Einen solchen Wachstumsschub machen kleine Kinder vor dem 5. Lebensjahr und große Kinder vor dem 12. (Mädchen) und 14. (Jungen) Lebensjahr durch. In dieser Zeit kann sich eine vorbestehende noch harmlose Skoliose zu einer richtig schlimmen Verformung der Wirbelsäule auswachsen.</p>
                        <h2>Und du?</h2>
                        <p>Damit wir einschätzen können, ob du gefährdet bist, benötigen wir zuerst dein Alter.</p>
                         <v-menu
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field

                                v-model="computedDateFormatted"
                                label="Geburtsdatum"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                                @click:clear="date = null"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              ref="picker"
                              v-model="date"
                              :max="new Date().toISOString().substr(0, 10)"
                              min="1950-01-01"
                              @change="save"
                            ></v-date-picker>
                          </v-menu>
                    </div>
                    <div v-if="cont1_set || date">
                        <div ref="cont2_text"></div>
                        <p v-if="date">Du bist <strong> {{computedYears}} Jahre </strong> alt.</p>
                        <p v-if="ageGroup==2">Du kommst in deine aktive Wachstumsphase oder bist noch mittendrin. Für Dich sollte das Thema Skoliose wichtig sein.</p>
                        <p v-if="ageGroup==3">Das Thema Skoliose hat für dich noch Relevanz für die Planung des weiteren Lebens.</p>
                        <p v-if="ageGroup==4">Du bist schon erwachsen. Außer bei schweren Skolioseformen sollte das Thema für dich keine Relevanz mehr haben.</p>
                        <p v-if="ageGroup==1">Du bist noch vor dem Wachstumsschub. Trotzdem sollte man deinen Rücken mal anschauen. Manchmal gibt es Skoliose auch bei Kindern in deinem Alter.</p>
                        <v-divider></v-divider>
                       <h2>Wie gehts es denn jetzt weiter?
                        <v-btn
                          text
                          color="primary"
                          @click="cont2"
                        >
                          Weiterlesen
                        </v-btn></h2>
                        <div v-if="cont2_set">
                                    <v-overlay
                                            v-if="!isAuthenticated"
                                      :absolute=true
                                      :value="overlay"
                                      >
                                    <v-card
                                        class="mx-auto"
                                        outlined>
                                        <v-card-title>
                                            Anmeldung erforderlich
                                        </v-card-title>
                                            <v-card-actions>
                                          <v-btn
                                            outlined
                                            rounded
                                            text
                                            @click="gotoNxt"
                                          >
                                            Jetzt anmelden
                                          </v-btn>
                                                <v-btn
                                            outlined
                                            rounded
                                            text
                                            @click="overlay = !overlay"
                                          >
                                            Ich will mich nicht anmelden
                                          </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                    </v-overlay>
                        </div>

                    </div>
                </template>
            </v-col>
        </v-row>

</template>



<script>
    import {mapGetters} from "vuex";

    export default {
        data: () => ({
            data_quant: {
                rating_danger: 0,
                rating_importance: 0,
                age: null
            },
            data_cat: {
                scoliosispatient: false,
            },
            date: null,
            menu: false,
            birthdayAlreadyKnown: false,
            cont1_set:false,
            cont2_set:false,
            overlay:true,
    }),
        mounted() {
            this.date=this.$store.getters['auth/getterBirthday']
            if (this.date) {
                this.birthdayAlreadyKnown=true;
            }
        },
    watch: {
      menu (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
      },
    },
        computed: {
            ...mapGetters("auth", ["isAuthenticated",'getterFirstname','getterBirthday']),

            computedDateFormatted () {
                if (this.date) {
                    return this.formatDate(this.date)
                } else {
                    return null
                }
            },
            computedYears () {
                 if (this.date) {
                     return this.getYears(this.date)
                } else {
                    return null
                }
                },
            ageGroup () {
                const age=this.getYears(this.date)

                if (age<10 && age > 0) { return 1 }
                if (age >9 && age < 15) { return 2 }
                if (age > 14 && age < 18) { return 3}
                if (age > 17) { return 4 }
                return 0
            },


        },
        methods: {
            cont1() {
                this.cont1_set=true;
                this.$vuetify.goTo(this.$refs.cont1_text, {duration: 300, easing: 'easeInOutCubic'})
            },
            cont2() {
                if (this.isAuthenticated) {
                    this.gotoNxt()
                } else {
                    this.cont2_set = true;
                }
            },
            nextStep (ag) {
                let s
                if (this.scoliosispatient) {
                    s='scoliotic-'
                } else {
                    s='nonscoliotic-'
                }
                if (ag==1) {
                    s+='child'
                }
                if (ag==2 | ag==3) {
                    s+='teen'
                }
                if (ag==4) {
                    s+='adult'
                }
                return s
            },

            gotoNxt() {
                this.$router.push({'name':this.nextStep(this.ageGroup)}).catch(()=> {
                    console.log('Redirect catched')
                })
            },
          save (date) {
            this.$refs.menu.save(date)
              if (!this.birthdayAlreadyKnown) {
                  this.$store.commit({tempBirthday: date})
              }
              this.$vuetify.goTo(this.$refs.cont2_text, {duration: 300, easing: 'easeInOutCubic'})
          },
            formatDate (date) {
                const [year, month, day] = date.split('-')
                return (day + '.' + month + '.' + year)
            },
            getYears (date) {
                const today = new Date().getTime()
                const birthday = new Date(date).getTime()
                var Difference_In_Years = (today-birthday) / (1000 * 3600 * 24 * 365);
                return Math.round(Difference_In_Years)
            },
    },
        props: {
        },
    };
</script>
