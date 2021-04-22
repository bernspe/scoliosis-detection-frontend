<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
              <v-btn
                  class="mx-2"
                  color="primary"
                      v-bind="attrs"
                      v-on="on"
                >
          Nachweise hochladen
                  <v-icon>
                mdi-upload
            </v-icon>

              </v-btn>
      </template>
      <v-card>
          <v-form
                  @submit.prevent="submit"
               ref="form"
            v-model="valid"
            lazy-validation
          >
        <v-card-title class="headline">
          Dokumente Hochladen
        </v-card-title>
        <v-card-text>Bitte fotografieren Sie das Dokument für uns erkennbar.</v-card-text>
          <v-card-text>
          <v-file-input
                      v-model="files"
            accept="image/png, image/jpeg, image/bmp"
            placeholder="Bitte Dokument fotografieren"
            prepend-icon="mdi-camera"
            label="proof"
            counter
            multiple
            outlined
            :show-size="1000">
                         <template v-slot:selection="{ index, text }">
                  <v-chip
                    v-if="index < 2"
                    color="deep-purple accent-4"
                    dark
                    label
                    small
                  >
                    {{ text }}
                  </v-chip>

                  <span
                    v-else-if="index === 2"
                    class="overline grey--text text--darken-3 mx-2"
                  >
                    +{{ files.length - 2 }} Datei(en)
                  </span>
                </template>
          </v-file-input>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
                  :disabled="!valid || isLoading"
            color="green darken-1"
            text
            type="submit"
          >
            Hochladen
          </v-btn>
            <v-spacer></v-spacer>
          <v-slide-x-reverse-transition>
            <span v-if="hasFailed" class="text-caption red--text"
              >Bitte versuch es nochmal.</span
            >
          </v-slide-x-reverse-transition>
            <v-progress-circular
                v-if="isLoading"
                indeterminate
                color="primary"
                :size="20"
                :width="2"
              ></v-progress-circular>
        </v-card-actions>
          </v-form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import axios from "axios";

  const STATUS = {
      error: "error",
      loading: "loading",
      success: "success",
      pause: "pause"
  }

  export default {
      props: {
          proof_type: String,
      },
    data: () => ({
        status: null,
        dialog:false,
        valid: false,
      files: [],
        successfully_uploaded: [],
    }),
      computed: {
          isSuccess() {
              return this.status === STATUS.success;
          },
          isLoading() {
          return this.status === STATUS.loading;
        },
        hasFailed() {
          return this.status === STATUS.error;
        },
      },
      methods:
          {
              submit: function() {
                  this.files.forEach((file) => {
                      this.status=STATUS.loading
                      const tempform = new FormData();
                      tempform.append('proof_type', this.proof_type);
                      tempform.append('img', file)
                      var config = {
                          method: 'POST',
                          url: process.env.VUE_APP_BACKEND_URL + process.env.VUE_APP_USERPROOF,
                          data: tempform,
                          headers: {
                              authorization: `Bearer ${this.$store.state.token}`,
                              'Content-Type': 'multipart/form-data'
                          },
                          xhrFields: {
                              withCredentials: true
                          },
                      };
                      axios(config).then((response) => {
                          this.successfully_uploaded.push(response.data)
                      }).catch((e) => {
                          console.log(e)
                          this.status=STATUS.error
                      })
                  })
                  if (this.status != STATUS.error) {
                      this.status=STATUS.success
                      this.$emit('updateProofs',{uploaded: this.successfully_uploaded})
                      this.dialog=false

                  }
            },

          }

  }
</script>