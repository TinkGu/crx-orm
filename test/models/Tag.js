export default function TagModel(store) {
    const schema = store.createSchema(store, {
        name: 'tag',
        properties: {
            name: {
                type: 'string',
                required: true,
                setIndex: true, // one-to-one
            },
        },
    })

    async function readTag(doc) {
        const id = await getDocId(doc)
        return schema.readById(id)
    }

    async function createTag(name) {
        if (!name.trim()) {
            return
        }

        const doc = await schema.read('name', name)
        if (doc) {
            return doc
        } else {
            return schema.create({ name })
        }
    }

    // update tag by doc(with id or name)
    async function updateTag(idOrdoc, setter) {
        const id = await getDocId(idOrdoc)
        await schema.update(id, setter)
        return schema.readById(id)
    }

    async function removeTag(doc) {
        const id = await getDocId(doc)
        return schema.remove(id)
    }

    // get id from { name } or { id } or raw string
    async function getDocId(doc) {
        if (typeof doc === 'string') {
            return doc
        }

        if ('name' in doc) {
            return schema.readRaw('name', doc.name.trim())
        }

        if ('id' in doc) {
            return doc.id
        }

        // TODO, 没有合法的 id 或索引，报错
    }


    return {
        ...schema,
        readTag,
        createTag,
        updateTag,
        removeTag,
    }
}
