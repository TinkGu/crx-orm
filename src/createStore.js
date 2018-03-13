import higherCreateSchema from './createSchema'

export default function createStore({
    adapter,
    schemas = [],
}) {
    const store = {
        adapter,
        gStoreKey,
        gIdsStoreKey,
        models: {},
    }
    store.createSchema = higherCreateSchema(store)
    schemas.forEach(x => {
        const model = x(store)
        store.models[model.name] = model
    })
    return store
}

function gStoreKey(model, k, v) {
    return `${model}:${k}:${v}`
}

function gIdsStoreKey(model) {
    return `${model}Ids`
}
