import createStore from './createStore'
import createCrxAdapter from './crxAdapter'
import createMemoryAdapter from './memoryAdapter'

import { installOrmToVue, installOrmToVuex } from './vuex'

export default {
    createStore,
    createCrxAdapter,
    createMemoryAdapter,
    installOrmToVue,
    installOrmToVuex
}
