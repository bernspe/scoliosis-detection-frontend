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
        v-for="(item,i) in items"
        :key="i"
        :src="basePath+item.src"
        reverse-transition="fade-transition"
        transition="fade-transition"
        contain
    >

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
             items: [
                {src: 'intro_willkommen.jpg'},
                {src: 'intro_authentizitaet.jpg'},
                {src: 'intro_precision.jpg'},
                {src: 'intro_cowork.jpg'},
            ]

    }),
        computed: {
                   basePath: () => {
                       return 'https://skoliosekinder.de/images_intro/'
            }
        },
        watch: {
            model(newValue, oldValue) {
                if ((newValue>oldValue) && (newValue===3)) {
                    this.$emit('IntroFinished')
                }
            }
        }
    };
</script>
