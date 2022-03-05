<template>
    <v-col
        :offset="senderMsg ? '2' : '0'"
        cols="10"
    >
                  <v-textarea :label="sender+ timestamp"
                                                dense readonly auto-grow outlined
                                                :value="crentry ? parse_msg(crentry.text).text : ''"
                                                rows="2"
                                                row-height="12"
                                                :background-color="senderMsg ? 'amber lighten-4': 'white'"
                                                >
                                      <template v-slot:append v-if="parse_msg(crentry.text).command!=null">
                                          <v-btn color="primary" outlined @click="goToTarget(parse_msg(crentry.text).command,parse_msg(crentry.text).target)">Erledigen</v-btn>
                                      </template>

                  </v-textarea>
        </v-col>
</template>

<script>
    import {mapGetters} from "vuex";
    import {convertUTCTime} from "@/store/modules/caseroom";
     import {DateTime} from "luxon";

    export default {
        name: 'Caseroomentry',
        props: {
            id: String,
            entry: Object,
            include_date: Boolean,
        },
        computed: {
            ...mapGetters("auth", ['getterUsernameSimple', 'getterFirstname']),
            ...mapGetters("caseroom", ['getParticipantFullname', 'getCurrentCrMsgs', 'getCurrentCr', 'getCurrentCrId', 'getCurrentCrMemberStatus', 'getParticipantDocument', 'getUserCaseRooms', 'hasSSM']),
            timestamp: function() {
                if (this.crentry) {
                    if (this.include_date) {
                        return this.convertdt(this.crentry.created)
                    } else {
                        return this.crentry.created_time
                    }
                } else {
                    return null
                }
            },
            senderMsg: function() {
                return this.crentry ? (this.getterUsernameSimple == this.crentry.sender) : false
            },
            receiverMsg: function() {
                return this.crentry ? (this.getterUsernameSimple != this.crentry.sender) : false
            }

        },
        asyncComputed: {
            crentry: {
                get() {
                    if (this.entry) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                this.$emit('crentryloaded',{id: this.entry.id})
                                resolve(convertUTCTime(this.entry))
                            })
                        })
                    }
                    if (this.id) {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                this.$store.dispatch('caseroom/retrieveCrMsg', this.id)
                                    .then((result) => {
                                        this.$emit('crentryloaded',{id: this.id})
                                        resolve(convertUTCTime(result))

                                    })
                                    .catch((e) => reject(e))
                            })
                        })
                    }
                },
                watch: ['id','entry'],
                default: {text:'',command:null,target:null}
            },
            sender: {
                get() {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (this.crentry) {
                                if (this.getParticipantFullname(this.crentry.sender)) {
                                    resolve(this.getParticipantFullname(this.crentry.sender) + ': ')
                                } else {
                                    resolve('ehemaliger Teilnehmer: ')
                                }
                            } else {
                                reject('')
                            }
                        })
                    })
                },
                watch:['crentry','getUserCaseRooms'],
                default:''
            }

        },
        methods: {
             convertdt (dt) {
                    const dtc=DateTime.fromISO(dt)
                    return dtc.toLocaleString(DateTime.DATETIME_MED)
            },
            parse_msg(msg) {

                if (msg.includes('$ACTION=')) {
                    const a= msg.split('$ACTION=')
                    const act = a[1].split(':')
                    return {'text':a[0],'command':act[0],'target':act[1]}

                } else {
                    return {'text':msg, 'command':null,'target':null}
                }
            },

            goToTarget(command,target) {
                if ((command!=null) && (target!=null)) {
                    this.$router.push({ name: 'caseroom', params: {id: target} })
                }
            },
        },

    };
</script>
