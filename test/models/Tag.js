export default function TagModel(store) {
    const schema = store.createSchema({
        name: 'tag',
        properties: {
            name: {
                type: 'string',
                required: true,
                setIndex: true,
            },
        },
    })

    return schema
}
