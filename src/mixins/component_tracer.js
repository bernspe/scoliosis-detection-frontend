import {mapGetters} from "vuex";
import helptour from "./helptour.json"

export default {
  data: () => {
    return {
      traces: null,
      component_trace_count: 0,

      tourOptions: {
                useKeyboardNavigation: false,
                labels: {
                    buttonSkip: 'Überspringen',
                    buttonPrevious: 'Vorherige',
                    buttonNext: 'Nächste',
                    buttonStop: 'OK'
                  },
            },
    }
  },
  mounted() {
      var name=this.$options.name

      if (this.getterUserObject) {
          var ut_base= this.getterUserObject.component_trace
        var ut= ut_base ? ut_base[name] ? Object.assign(ut_base,{[name]: {...ut_base[name], 'mount_count': Object.hasOwnProperty.call(ut_base[name],'mount_count') ? ut_base[name]['mount_count'] + 1 : 0}}) : {...ut_base, [name]: {'mount_count':1}} : {[name]: {'mount_count':1}}
        this.$store.dispatch('auth/updateAccountDetails', {component_trace: ut})
      }
      if (this.getterInformationSwitch){
          this.$store.commit('toggleInformationSwitch')
      }

  },
  beforeDestroy: function () {
    //this.write_trace_to_store()
  },
  computed: {
    ...mapGetters('auth',["isAuthenticated",'getterUserObject',"getterComponentTraces"]),
      ...mapGetters(['getterInformationSwitch']),

  },
    asyncComputed: {
        tourSteps: {
            get() {
                var name = this.$options.name
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (Object.prototype.hasOwnProperty.call(helptour,name))
                        {
                            if (Object.prototype.hasOwnProperty.call(helptour[name],'steps')) {
                                resolve(helptour[name].steps.filter((x) => !!document.querySelector(x.target)))
                            } else resolve([])
                        }
                        else resolve([])
                    }, 1000)
                })
            },
            default: []
        },
    }, 
    watch: {
      getterInformationSwitch: {
          handler(newVal,oldVal) {
              if (newVal && !oldVal) {
                    this.startTour();
                  } else this.stopTour();
              }
          },
    },

  methods: {
      startTour(dialog) {
          if (this.tourSteps.length===0) return
          var name=this.$options.name
          var store = this.$store
          if (this.$tours[name+"Tour"]) {
              if (!dialog) this.$tours[name + "Tour"].callbacks.onFinish= () => { store.commit('toggleInformationSwitch')}
              if ((name==='App') && (this.isAuthenticated)) {
                  // dont start App tour if the user is already authenticated
              } else this.$tours[name + "Tour"].start();
          }
      },
      stopTour() {
          var name=this.$options.name
                  if (this.$tours[name+"Tour"]) {
                      this.$tours[name + "Tour"].stop();
                  }
      },


  }
}

