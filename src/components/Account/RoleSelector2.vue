<template>
        <v-select
          v-model="select"
          :items="items"
          :label=labelval
          chips
          return-object
          @change="changedetect"
        >

        </v-select>

</template>


<script>


  import axios from "axios";
  import {mapGetters} from "vuex";

  export default {
      props: {
          value: {
              type: [String, Array],
          },
          proofs:Array,
          label: String,
          audience: String,
          birthday_date_str: String,
            ignore_age:Boolean,
      },
    data: () => ({
        select:'',
        items:[],
        proof:[],

    }),
      computed: {
              ...mapGetters('auth',['isStaff','isAdmin']),
              value_checked() {
                return (typeof(this.value)===String) ? this.value : this.value.length>0 ? this.value[0] : null
              },
          birthday_date () {
            return new Date(this.birthday_date_str);
          },
        labelval () {
            return this.label ? this.label : 'Ich bin ...'
        },
        population () {
            return this.audience ? this.audience : (this.isStaff || this.isAdmin) ? 'list-all': 'list-users'
        },
        age() {
            return this.getYears(this.birthday_date)
        },

      },
      methods: {
          getYears (date) {
                const today = new Date().getTime()
                const birthday = new Date(date).getTime()
                var Difference_In_Years = (today-birthday) / (1000 * 3600 * 24 * 365);
                return Math.round(Difference_In_Years)
            },

        changedetect: function () {
            this.$emit('updateRole',{value: [this.select.key], proof: this.select.proof})
        }
      },
      mounted(){
          var this1=this;
          const config = {
                  url: this.$store.state.endpoints.userroles2,
                method: 'POST',
                  headers: {
                      'authorization': `Bearer ${this1.$store.state.token}`,
                      'Content-Type': 'application/json'
                  },
                  xhrFields: {
                      withCredentials: true
                  },
                data: {"language":"de","format":this1.population,"ignoreage":this1.ignore_age}
          }
          axios(config).then(function (response) {
              this1.items= response.data;
          }).catch((error) => {
              console.log(error)
          })
              .then(()=> {
                      this1.select=(this1.items.find(x=> x ? x.key===this1.value_checked : null))

          }).then(()=> {
            //this1.distillSelection()
              if (this1.select) this.$emit('updateRole',{value: [this.select.key], proof: this.select.proof})
          });
      }
  }
</script>