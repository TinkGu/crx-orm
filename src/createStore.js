import higherCreateSchema from './createSchema'
import { relationshipFields, createRelationsManager } from './relationship'

export default function createStore({
    adapter,
    schemas = [],
}) {
    const relationsManager = createRelationsManager()
    const store = {
        adapter,
        gStoreKey,
        gIdsStoreKey,
        relationship: relationshipFields,
        relationsManager,
        models: {},
    }
    store.createSchema = higherCreateSchema(store)
    schemas.forEach(x => {
        const model = x(store)
        relationsManager.resolve(model)
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
