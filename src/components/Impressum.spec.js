import {mount} from '@cypress/vue'
import Impressum from "@/components/Impressum";
import {createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import vuetify from '@/plugins/vuetify'
import actions from '@/store/actions';
import mutations from '@/store/mutations';
import state from '@/store/state';
import * as getters from '@/store/getters';

const localVue = createLocalVue()
localVue.use(Vuex)

it('Impressum', () => {

    let store

    store = new Vuex.Store({state, getters, mutations,actions
    })

    mount(Impressum, {store, localVue, vuetify})

    cy.get('[data-cy=skolioselogo]').should('be.visible')
})


/*
import {createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
//import storeConfig from './store-config'
import {cloneDeep} from 'lodash'

const actions =require('@/store/actions');
const mutations = require('@/store/mutations');
const state = require('@/store/state');
//import * as getters from '@/store/getters';

describe('Impressum.vue - 2nd', () => {

    test('reads user data', () => {
        const localVue = createLocalVue()
        localVue.use(Vuex)
        const store = new Vuex.Store(cloneDeep({
    //modules: { auth, caseroom,mlmodel,imagecenter,messagehub,userfindinvite },
    //namespaced: true,
    mutations,
    actions,
    state,
  // getters
}
))

        expect(store.state).to.have.nested.property('versions')

    })

})
*/