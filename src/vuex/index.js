/* eslint-disable no-param-reassign */
import { getFieldList } from '../utils'

export function installOrmToVuex(createOrm, options = {}) {
    const namespace = options.namespace || 'entities'

    return vuexStore => {
        vuexStore.registerModule(namespace, {
            namespaced: true,
            state: {
                data: {},
            },
            mutations: {
                set(state, content) {
                    if (typeof content === 'object') {
                        state.data = Object.assign({}, state.data, content)
                    }
                },
                remove(state, field) {
                    const finalFields = getFieldList(field)
                    finalFields.forEach(x => {
                        state.data[x] = null
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
            const _data = vuexStore.state[namespace].data
            if (typeof field === 'string') {
                result = _data[finalFields[0]]
            } else {
                if (finalFields.length > 0) {
                    result = {}
                    finalFields.forEach(x => {
                        result[x] = _data[x]
                    })
                }
            }

            resolve(result)
        })
    }

    async function set(content) {
        return vuexStore.commit(`${namespace}/set`, content)
    }

    async function remove(field) {
        return vuexStore.commit(`${namespace}/remove`, field)
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
