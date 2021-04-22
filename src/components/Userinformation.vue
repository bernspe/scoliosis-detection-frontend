<template>
<v-row>
<v-col cols="4">

        <v-img
              :src="getImgUrl('@assets/entry/scoliosis_back3_large.png')"
              class="white--text align-end"
              height="300px"
        ></v-img>
    </v-col>
    <v-col cols="8">
        <h1>Hallo  </h1>

</v-col>
    </v-row>
</template>

<script>
    export default {
        methods: {
            getImgUrl(pic) {
                return require(pic)
            },
        },
        props: ['sidewallpic','data'],
    };
</script>
