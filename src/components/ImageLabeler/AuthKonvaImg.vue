<template>
    <v-container>
        <v-image :config="{
            image: image,
            scaleX: scale,
            scaleY: scale,
            x: offset_x,
            y:offset_y,
          }"/>
    </v-container>

</template>

<script>
    export default {
        name: 'Authkonvaimg',
        props: ['src', 'framesize'],
        data() {
            return {
                image: null,
                scale: null,
                offset_x: 0,
                offset_y: 0,
            };
        },
        computed: {},
        methods: {
            setProportions() {
                var image = this.image
                if (image) {
                    var portrait = image.width < image.height
                    var landscape = image.width > image.height
                    let scalefactor = this.framesize / image.height
                    if (portrait) {
                        scalefactor = this.framesize / image.height
                        this.offset_x = (this.framesize - (image.width * scalefactor)) / 2
                    }
                    if (landscape) {
                        scalefactor = this.framesize / image.width
                        this.offset_y = (this.framesize - (image.height * scalefactor)) / 2
                    }
                    this.scale = scalefactor

                    this.$emit('imageloaded', {
                        'scalefactor': scalefactor,
                        'offset_x': this.offset_x,
                        'offset_y': this.offset_y,
                        'image': image,
                    })
                }

            },

            loadimage() {
                const image = new window.Image();
                image.src = this.src;
                var this1 = this
                image.onload = () => {
                    // set image only when it is loaded
                    this1.image = image;
                    this1.setProportions()
                }
            },
        },

        created() {
            this.loadimage()

        },
        watch: {
            src(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.loadimage()
                }
            },
            framesize(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.setProportions()
                }
            },
            imgParams(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.scale = this.imgParams.scalefactor
                    this.offset_x = this.imgParams.offset_x
                    this.offset_y = this.imgParams.offset_y
                }
            }
        }
    };
</script>
