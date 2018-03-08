import createSchema from './createSchema'

export default function createStore({
    adapter,
    schemas = [],
}) {
    const store = {
        ...adapter,
        gStoreKey,
        gIdsStoreKey,
        createSchema,
    }
    const models = {}
    schemas.forEach(x => {
        const model = x(store)
        models[model.name] = model
    })

    return {
        adapter,
        gStoreKey,
        gIdsStoreKey,
        models,
    }
}

// function init() {
//
// }

function gStoreKey(model, k, v) {
    return `${model}:${k}:${v}`
}

function gIdsStoreKey(model) {
    return `${model}Ids`
}
