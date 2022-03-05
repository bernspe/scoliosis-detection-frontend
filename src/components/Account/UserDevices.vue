<template>
    <v-list-item>
        <v-list-item-avatar>
            <v-icon v-if="device.device_type=='mobile'">mdi-cellphone  </v-icon>
            <v-icon v-if="device.device_type=='tablet'">mdi-tablet </v-icon>
            <v-icon v-if="device.device_type=='desktop'">mdi-laptop  </v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
            <v-list-item-title v-if="!thisdevice && device.isCurrentDevice">
                Aktuelles Gerät
            </v-list-item-title>
            <v-list-item-title v-else>
                <span v-if="device.device_type=='mobile'">Smartphone</span>
                <span v-if="device.device_type=='tablet'">Tablet</span>
                <span v-if="device.device_type=='desktop'">Computer</span>
            </v-list-item-title>
            <v-list-item-subtitle v-if="!thisdevice">
                Hinzugefügt am {{ convertdt(device.created) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
                <span
                     class="d-inline-block text-truncate"
                        style="max-width: 300px;"
                    >
                {{ device.device_descriptor }}
                </span>
            </v-list-item-subtitle>
            </v-list-item-content>

        <v-list-item-action id="tracer_userdevices_action">
            <v-btn icon v-if="(thisdevice && !isListed)" @click="addItem">
                <v-icon color="green">mdi-plus-circle-outline</v-icon>
            </v-btn>
            <v-btn icon v-if="(!thisdevice)" @click="removeItem">
                <v-icon color="red">mdi-trash-can-outline</v-icon>
            </v-btn>
        </v-list-item-action>

    </v-list-item>

</template>

<script>

    import DateTime from "luxon/src/datetime";

    export default {
        name: 'Userdevices',

        props: {
            device: Object,
            thisdevice: Boolean,
        },

        computed: {
           isListed: function() {
               return Boolean(this.device.isInList)
           }
        },
        methods:{
             convertdt: (dt) => {
                 const dtc = DateTime.fromISO(dt)
                 return dtc.toLocaleString(DateTime.DATETIME_MED)
             },

            addItem: function(){
              this.$emit('addDevice')
          },
          removeItem: function(){
                  this.$emit('removeDevice', {id: this.device.id})
          }
        },


    };
</script>
