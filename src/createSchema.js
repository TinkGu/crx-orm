import uuid from 'uuid'

export default function createSchema(store, {
    name,
    properties = {},
}) {
    const indexProps = Object.keys(properties).filter(x => properties[x].setIndex)
    const gStoreKey = (k, v) => store.gStoreKey(name, k, v)
    const idsStoreKey = store.gIdsStoreKey(name)

    // 验证
    function validate(doc) {
        // TODO
        // 验证 type, required, 定义过的项
        // loose 模式下不验证
        return doc
    }


    /**
     * read the value of the specified storeKey
     */
    async function readRaw(fieldname, fieldv) {
        return store.read(gStoreKey(fieldname, fieldv))
    }

    /**
     * read document by id or key-value
     */
    async function read(fieldname, fieldv) {
        if (fieldname !== 'id') {
            const id = await readRaw(fieldname, fieldv)
            if (id) {
                return readRaw('id', fieldv)
            } else {
                return Promise.resolve(null)
            }
        } else {
            return readRaw('id', fieldv)
        }
    }

    /**
     * read document by id
     */
    async function readById(id) {
        return read('id', id)
    }

    /**
     * read model ids
     */
    async function readIds() {
        return store.read(idsStoreKey)
    }


    /**
     * create document
     */
    async function create(raw = {}, options = {}) {
        const { omitReturn } = options
        const id = uuid()
        const doc = {
            ...validate(raw),
            id,
        }

        if (await hasConflict(id, doc)) {
            // TODO: 报错
        }

        const ids = (await readIds()) || []
        const indexes = createIndexes(doc)

        const returns = await store.set({
            ...indexes,
            [gStoreKey('id', id)]: doc,
            [idsStoreKey]: ids.concat(id),
        })

        if (omitReturn) {
            return returns
        } else {
            return returns || readById(id)
        }
    }

    // QUESTION: indexProps 对应的值为 null 或 undefined 时，是否允许继续 set？

    /**
     * update document by setter object or setter function
     *
     * @param  {string} id target id
     * @param  {function|object}
     */
    async function update(id, setter) {
        const oldDoc = await readById(id)
        if (!oldDoc) {
            // TODO: 报错，不存在
        }

        const doc = typeof setter === 'function'
            ? setter(oldDoc)
            : Object.assign({}, oldDoc, setter)
        doc.id = id

        if (await hasConflict(id, doc)) {
            // TODO: 报错
        }

        const indexes = Object.assign({},
            getUselessOldIndexes(doc, oldDoc),
            createIndexes(doc))

        return store.set({
            ...indexes,
            [gStoreKey('id', id)]: doc,
        })
    }

    async function remove(id) {
        const doc = await readById(id)
        if (!doc) {
            return
        }

        const ids = (await readIds()) || []
        const indexes = createIndexesWithValue(doc, null)

        return store.set({
            ...indexes,
            [gStoreKey('id', id)]: null,
            [idsStoreKey]: ids.filter(x => x !== id),
        })
    }

    // -------------------------------
    //            utils
    // -------------------------------

    function indexPropsFrom(doc) {
        return indexProps.filter(x => x in doc)
    }

    function createIndexesWithValue(doc, value) {
        const indexes = {}
        indexPropsFrom(doc).forEach(x => {
            const newField = gStoreKey(x, doc[x])
            indexes[newField] = value
        })
        return indexes
    }

    function createIndexes(doc) {
        return createIndexesWithValue(doc, doc.id)
    }

    function hasConflict(id, doc) {
        const indexes = indexPropsFrom(doc).map(x => gStoreKey(x, doc[x]))
        return store.read(indexes).then(res => {
            return Object.keys(res).some(x => x && x !== id)
        })
    }

    function getUselessOldIndexes(newDoc, oldDoc) {
        const indexes = {}
        indexPropsFrom(newDoc).forEach(x => {
            if (newDoc[x] !== oldDoc[x]) {
                indexes[gStoreKey(x, oldDoc[x])] = null
            }
        })
        return indexes
    }

    return {
        name,
        properties,
        idsStoreKey,
        read,
        readRaw,
        readById,
        readIds,
        create,
        update,
        remove,
    }
}
