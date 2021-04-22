<template>
  <div class="mt-8 text-center" margin-top="60px">
    <div class="d-flex justify-center mb-6">
<!--
  <v-card
    class="mx-auto"
    max-width="800"
    tile
  >
    -->
    <v-container fluid>
      <v-row dense>
        <v-col
          v-for="card in cards"
          :key="card.title"
          :cols="card.flex"
        >
          <v-card>
            <v-img
              :src="getImgUrl(card.src)"
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="300px"
            >
              <v-card-title v-text="card.title"></v-card-title>
            </v-img>

            <v-card-actions>
              <v-spacer></v-spacer>

                    <v-btn
                  tile
                  color="success"
                  @click.native="$router.push(card.link)"
                >
                  <v-icon left>
                    mdi-chevron-right
                  </v-icon>
                  Weiterlesen
                </v-btn>

              <v-btn icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!--
      </v-card>
      -->
    </div>
  </div>

</template>

<script>
    export default {
        data: () => ({
      cards: [
        { title: 'Habe ich Skoliose?', src: 'scoliosis_back3.png', link:'userinformation/teens', flex: 12 },
        { title: 'Hat mein Kind Skoliose?', src: 'skoliose_plus_erschrocken.png', link:'userinformation', flex: 4 },
        { title: 'Skoliose sicher erkennen', src: 'skoliose_plus_nachdenklich.png', link:'userinformation', flex: 4 },
      ],
    }),
      methods: {
        getImgUrl(pic) {
                return require('../assets/entry/'+pic)
        },
      },

        props: {
        },
    };
</script>
