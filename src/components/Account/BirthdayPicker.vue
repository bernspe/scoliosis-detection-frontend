<template>
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
</template>

<script>

    export default {
        data: () => ({
            date: null,
            menu: false,
    }),
        mounted() {
            this.date=this.birthday_date
        },
    watch: {
      menu (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
      },
    },
        computed: {

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
            sendDateISO() {
                this.$emit('updateBirthday',{date: this.date})
            },
          save (date) {
            this.$refs.menu.save(date)
              this.sendDateISO()
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
            birthday_date: String,
        },
    };
</script>
