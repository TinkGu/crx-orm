/* eslint-disable no-param-reassign */
import { getFieldList } from '../utils'

export function installOrmToVuex(createOrm, options) {
    const namespace = options.namespace || 'entities'

    return vuexStore => {
        vuexStore.registerModule(namespace, {
            state: {},
            mutations: {
                set(state, content) {
                    if (typeof content === 'object') {
                        state = Object.assign(state, content)
                    }
                },
                remove(state, field) {
                    const finalFields = getFieldList(field)
                    finalFields.forEach(x => {
                        state[x] = null
                    })
                },
            },
        })

        const adapter = createVuexAdapter(vuexStore, namespace)
        vuexStore.orm = createOrm(adapter)
    }
}

export function installOrmToVue() {
    return {
        install(Vue) {
            Vue.mixin({
                beforeCreate() {
                    const options = this.$options
                    if (options.store && options.store.orm) {
                        this.$models = options.store.orm.models
                    } else if (options.parent && options.parent.$models) {
                        this.$models = options.parent.$models
                    }
                },
            })
        },
    }
}

function createVuexAdapter(vuexStore, namespace) {
    function read(field) {
        const finalFields = getFieldList(field)
        return new Promise(resolve => {
            let result = null
            if (typeof field === 'string') {
                result = vuexStore.state[finalFields[0]]
            } else {
                if (finalFields.length > 0) {
                    result = {}
                    finalFields.forEach(x => {
                        result[x] = vuexStore.state[x]
                    })
                }
            }

            resolve(result)
        })
    }

    function set(content) {
        return new Promise(resolve => {
            vuexStore.commit(`${namespace}/set`, content)
            resolve()
        })
    }

    function remove(field) {
        return new Promise(resolve => {
            vuexStore.commit(`${namespace}/remove`, field)
            resolve()
        })
    }

    function snapshot() {
        return vuexStore.state
    }

    return {
        read,
        set,
        remove,
        snapshot,
    }
}
