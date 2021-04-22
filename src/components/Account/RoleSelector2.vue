<template>
        <v-combobox
          v-model="select"
          :items="items"
          :label=labelval
          multiple
          chips
          return-object
          @change="changedetect"
        >
          <template v-slot:selection="data">
            <v-chip
              :key="JSON.stringify(data.item)"
              v-bind="data.attrs"
              :input-value="data.selected"
              :disabled="data.disabled"
              @click:close="data.parent.selectItem(data.item)"
            >

              <v-avatar
                class="accent white--text"
                left
                v-text="data.item.text.slice(0, 1).toUpperCase()"
              ></v-avatar>
              {{ data.item.text }}
            </v-chip>
          </template>
        </v-combobox>

</template>


<script>


  import axios from "axios";

  export default {
      props: {
          value:Array,
          proofs:Array,
          label: String,
          audience: String,
          birthday_date: Date,

      },
    data: () => ({
        select:[],
        items:[],
        proof:[],

    }),
      computed: {
        labelval () {
            return this.label ? this.label : 'Ich bin ...'
        },
        population () {
            return this.audience ? this.audience : 'list-users'
        },
        age() {
            return this.getYears(this.birthday_date)
        }
      },
      methods: {
          getYears (date) {
                const today = new Date().getTime()
                const birthday = new Date(date).getTime()
                var Difference_In_Years = (today-birthday) / (1000 * 3600 * 24 * 365);
                return Math.round(Difference_In_Years)
            },
          distillSelection: function () {
            // Geht die bisherigen Selektionen durch und stellt die dafür notwendigen Proofs zusammen
              let p=this.select.map(x => x.proof)
            this.proof=[]
            p.forEach((val) => {
                if (!this.proof.includes(val) && (val!='nan')) {
                    this.proof.push(val)
                }
            })
          },
        changedetect: function () {
            this.distillSelection()
            this.$emit('updateRole',{value: this.select.map(x => x.key), proof: this.proof})
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
                data: {"language":"de","format":this1.population}
          }
          axios(config).then(function (response) {
              this1.items= response.data;
          }).catch((error) => {
              console.log(error)
          })
              .then(()=> {
                  this1.value.forEach(role => {
                      this1.select.push(this1.items.find(x=> x.key==role))
                  })
          }).then(()=> {
            this1.distillSelection()
              this.$emit('updateRole',{value: this.select.map(x => x.key), proof: this.proof})
          });
      }
  }
</script>