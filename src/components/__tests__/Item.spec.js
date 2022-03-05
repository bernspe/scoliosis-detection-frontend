import impressum from '../Impressum.vue'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
localVue.use(Vuex)


describe('Impressum.vue', () => {
 test('sanity test', () => {
 expect(true).toBe(true)
 })
})

describe('Impressum.vue', () => {
  let getters
  let store
  let vuetify

   beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input',
     getterFrontendVersion: () => '',
    }

    store = new Vuex.Store({
      getters
    })
    vuetify = new Vuetify()

  })


 test('renders "item"', () => {
 const wrapper = mount(impressum,{store, vuetify,localVue})
 expect(wrapper.text()).toContain('Versionsnummern')
 })
})
