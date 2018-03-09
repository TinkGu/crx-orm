export default function TagModel(store) {
    const schema = store.createSchema(store, {
        name: 'tag',
        properties: {
            name: {
                type: 'string',
                required: true,
                setIndex: true, // one-to-one,
            },
        },
    })

    return schema
}
