import uuid from 'uuid'

export default store => function createSchema({
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
        return store.adapter.read(gStoreKey(fieldname, fieldv))
    }

    /**
     * read document by id or key-value or index prop
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
     * find a single document
     * use id first, then try other index properties
     * otherwise, return null
     */
    async function find(doc, options = {}) {
        const { isFull = true } = options
        const id = await readDocId(doc)
        if (id) {
            const newDoc = await read('id', id)
            if (isFull) {
                return fillServantsFields(newDoc)
            } else {
                return newDoc
            }
        } else {
            return null
        }
    }

    /**
     * read model ids
     */
    async function readIds() {
        return store.adapter.read(idsStoreKey)
    }

    /**
     * read all items by ids
     */
    async function all() {
        const ids = await readIds()
        if (ids) {
            const itemKeyList = ids.map(id => gStoreKey('id', id))
            const result = await store.adapter.read(itemKeyList)
            return Object.values(result)
        } else {
            return []
        }
    }

    /**
     * create document
     */
    async function create(raw = {}, options = {}) {
        const { omitReturn } = options
        const id = raw.id || uuid()
        const doc = {
            ...validate(raw),
            id,
        }

        if (await hasConflict(id, doc)) {
            // TODO 完善报错信息
            throw new Error('crx-orm: conflict')
        }

        const ids = (await readIds()) || []
        const indexes = createIndexes(doc)

        const returns = await store.adapter.set({
            ...indexes,
            [gStoreKey('id', id)]: doc,
            [idsStoreKey]: ids.concat(id),
        })

        if (omitReturn) {
            return returns
        } else {
            return returns || find(id)
        }
    }

    // QUESTION: indexProps 对应的值为 null 或 undefined 时，是否允许继续 set？

    /**
     * update document by setter object or setter function
     *
     * @param  {string} id target id
     * @param  {function|object}
     */
    async function update(queryDoc, setter, options = {}) {
        const { omitReturn } = options
        const oldDoc = await find(queryDoc)
        if (!oldDoc) {
            // TODO: 报错，不存在
        }

        const doc = typeof setter === 'function'
            ? setter(oldDoc)
            : Object.assign({}, oldDoc, setter)
        doc.id = oldDoc.id

        if (await hasConflict(doc.id, doc)) {
            // TODO: 报错
        }

        const indexes = Object.assign({},
            getUselessOldIndexes(doc, oldDoc),
            createIndexes(doc))

        const returns = await store.adapter.set({
            ...indexes,
            [gStoreKey('id', doc.id)]: doc,
        })

        if (omitReturn) {
            return returns
        } else {
            return returns || find(doc.id)
        }
    }

    async function remove(queryDoc) {
        const doc = await find(queryDoc)
        if (!doc) {
            return
        }

        const ids = (await readIds()) || []
        const indexes = createIndexesWithValue(doc, null)

        return store.adapter.set({
            ...indexes,
            [gStoreKey('id', doc.id)]: null,
            [idsStoreKey]: ids.filter(x => x !== doc.id),
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

    // 索引必须唯一，所以一旦试图创建已经存在的索引，必须报错
    async function hasConflict(id, doc) {
        const indexes = indexPropsFrom(doc).map(x => gStoreKey(x, doc[x]))
        if (indexes.length > 0) {
            return store.adapter.read(indexes).then(res => {
                return Object.keys(res).some(x => res[x] && res[x] !== id)
            })
        } else {
            return false
        }
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

    async function readDocId(doc) {
        if (typeof doc === 'string') {
            return doc
        }

        if (doc && typeof doc === 'object') {
            const props = Object.keys(doc)
            const indexProp = props.find(x => x.includes(indexProps))
            if (indexProp) {
                return readRaw(indexProp, doc[indexProp])
            }
        }

        return null
    }

    // 将 type relationship 标注的字段中的 id 填充为对应的 doc
    async function fillServantsFields(doc) {
        const newDoc = {}
        // NOTE： 记一个 storeKey: docKey 的 mapA，直接把 mapA 传入 store.read
        // store.read 返回一个 storeKey: doc 的 mapB
        // 通过遍历 mapB，获得最终的 newDoc
        const storeKeyDocKeyMap = {}
        const keys = Object.keys(properties).filter(key => properties[key].type === 'relationship'
            && key in doc
            && doc[key] !== null)

        if (keys.length === 0) {
            return doc
        }

        keys.forEach(key => {
            const prop = properties[key]
            if (prop.relationship === 'hasOne') {
                const storeKey = store.gStoreKey(prop.modelname, 'id', doc[key])
                storeKeyDocKeyMap[storeKey] = key
            }
            if (prop.relationship === 'hasMany' && Array.isArray(doc[key])) {
                doc[key].forEach(id => {
                    storeKeyDocKeyMap[store.gStoreKey(prop.modelname, 'id', id)] = key
                })
            }
        })

        const servants = await store.adapter.read(storeKeyDocKeyMap)
        Object.keys(servants).forEach(storeKey => {
            const docKey = storeKeyDocKeyMap[storeKey]
            const servantDoc = servants[storeKey]
            const newDocProp = newDoc[docKey]
            if (newDocProp) {
                if (Array.isArray(newDocProp)) {
                    newDoc[docKey].push(servantDoc)
                } else {
                    newDoc[docKey] = [newDocProp, servantDoc]
                }
            } else {
                newDoc[docKey] = servantDoc
            }
        })

        return {
            ...doc,
            ...newDoc,
        }
    }

    return {
        name,
        properties,
        idsStoreKey,
        read,
        readRaw,
        readIds,
        all,
        find,
        create,
        update,
        remove,
    }
}
