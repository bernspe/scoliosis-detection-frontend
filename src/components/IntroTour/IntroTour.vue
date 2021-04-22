<template>
        <v-dialog
      v-model="dialog"
      width="500"
    >

     <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="green lighten-2"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Einführung anzeigen
        </v-btn>
      </template>
    <v-carousel v-model="model">
     <v-carousel-item
      v-for="(color, i) in colors"
      :key="color"
    >
      <v-sheet
        :color="color"
        height="100%"
        tile
      >
        <v-row
          class="fill-height"
          align="center"
          justify="center"
        >
          <div class="display-3">
            Slide {{ i + 1 }}
          </div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
        </v-dialog>
</template>

<script>
    export default {
        props: {
        },
      data: () => ({
          dialog: false,
        model: 0,
      colors: [
        'primary',
        'secondary',
        'yellow darken-2',
        'red',
        'orange',
      ],
    }),
        watch: {
            model(newValue, oldValue) {
                if ((newValue>oldValue) && (newValue==4)) {
                    this.$emit('IntroFinished')
                }
            }
        }
    };
</script>
