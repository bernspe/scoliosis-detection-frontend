
import router from "@/router";

function construct_websocket(vm,username) {
            console.log('Username: ', username);
        vm.$connect(vm.$store.state.endpoints.webSocket + 'user/' + username + '/', {
          format: 'json',
          store: vm.$store,
            reconnection: true, // (Boolean) whether to reconnect automatically (false)
        reconnectionAttempts: 20, // (Number) number of reconnection attempts before giving up (Infinity),
        reconnectionDelay: 3000
        })
}

async function loadCaseRooms(vm) {
    await vm.$store.dispatch('caseroom/loadUserCaseRooms')
                        .then((result) => {
                          const ms = result.data.map(o => o.members);
                          const os = result.data.map(o => o.owner);
                          const unique_ms = [...new Set(ms.flat(1).concat(os.flat(1)))]
                          vm.$store.dispatch('auth/getMinimalUserProfiles', {'usernames': unique_ms})
                                  .then((result) => {
                                    vm.$store.commit('caseroom/setParticipants', result)
                                  })
                        }).then(() => {
                                  if (vm.$store.getters['auth/isCaregiver']) {
                                    vm.$store.dispatch('auth/getDependentChildren')
                                  }
                                  if (vm.$store.getters['auth/isMed']) {
                                    vm.$store.dispatch('auth/getMyPatients')
                                  }
                        })
}

async function loadSSMs(vm) {
  await vm.$store.dispatch('imagecenter/getssm_user_list')
}

async function getRoles(vm){
    await vm.$store.dispatch('auth/getUserRolesDict')
}

function final_relay(vm){
            if (vm.$store.getters['auth/isAuthenticated']) {
                vm.$store.dispatch('auth/getDevices')
                if (router.currentRoute.name !== "authorized_start") {
                router.push('/authorized_start')

            }}
}

export function run_init_after_auth(vm) {

    (async () => {
        vm.$store.commit('auth/checkAuthentication')
                vm.$store.dispatch('auth/checkToken')
                                  .then(() => {
                                      let username = vm.$store.getters['auth/getterUsername'];
                                      //console.log('Auth Token successfully checked: ',username)
                                      if (username) {
                                          construct_websocket(vm,username)
                                          loadCaseRooms(vm)
                                          loadSSMs(vm)
                                          getRoles(vm)
                                          final_relay(vm)
                                      }
                                  }).catch(() => {
                                      vm.$store.dispatch('auth/loginWRefreshToken')
                                        .then(() => {
                                            vm.$store.dispatch('auth/checkToken').then(()=> {
                                                let username = vm.$store.getters['auth/getterUsername'];
                                                //console.log('Refresh Token successfully checked: ', username)
                                                if (username) {
                                                    construct_websocket(vm, username)
                                                    loadCaseRooms(vm)
                                                    loadSSMs(vm)
                                                    getRoles(vm)
                                                    final_relay(vm)
                                                }
                                            })
                                        })
                                        .catch(() => {
                                             vm.$store.commit('auth/resetAuthStatus')
                                            if (router.currentRoute.name !== "preview") {
                                                 router.push('/preview')
                                            }
                                        })
                          }).finally(() => {
                              vm.$options.sockets.onclose = () => vm.$store.dispatch('auth/logout')
                            })

    })();
}