<template>
    <v-container>
    <v-carousel
    cycle
    hide-delimiter-background
    show-arrows-on-hover>
    <v-carousel-item
      v-for="(item,i) in items"
      :key="i"
      :src="basePath+item.src"
      reverse-transition="fade-transition"
      transition="fade-transition"
      contain
    ></v-carousel-item>
  </v-carousel>
        </v-container>
</template>
<script>
    export default {
        props: {
        },
      data: () => ({
            items: [
                {src: 'sicher.jpg'},
                {src: 'neu-sehen.jpg'},
                {src: 'precise.jpg'},
                {src: 'wachstum.jpg'},
                {src: 'skolioseverlauf-1.jpg'},
                {src: 'skolioseverlauf-2.jpg'},
                {src: 'skolioseverlauf-3.jpg'},
                {src: 'skoliose-sehen1.jpg'},
                {src: 'skoliose-sehen2.jpg'},
                {src: 'skoliose-sehen3.jpg'},
                {src: 'skoliose-sehen4.jpg'},
                {src: 'skoliose-sehen5.jpg'},
                {src: 'registrieren.jpg'},
                {src: 'wie-funktioniert-frage.jpg'},
                {src: 'funktion-stage1.jpg'},
                {src: 'funktion-kind-1.jpg'},
                {src: 'funktion-kind-2.jpg'},
                {src: 'funktion-orthopaede.jpg'},
                {src: 'funktion-stage2.jpg'},
                {src: 'funktion-stage3.jpg'},
                {src: 'fazit.jpg'},
            ]
    }),
        computed: {
           basePath: () => {
               return 'https://skoliosekinder.de/images/'
    }
        },

    };
</script>