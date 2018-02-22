import createSchema from './createSchema'

export default function createStore({
    adapter,
    schemas = [],
    shouldSetIndex = true,
}) {
    const store = {
        ...adapter,
        gStoreKey,
        gIdsStoreKey,
        createSchema,
        shouldSetIndex,
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
        shouldSetIndex,
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
