export function getFieldList(field) {
    if (typeof field === 'string') {
        return [field]
    }

    if (Array.isArray(field)) {
        return field
    }

    if (typeof field === 'object') {
        return Object.keys(field)
    }

    return []
}

export function higherUuid(store) {
    let uid
    async function next() {
        if (uid === undefined) {
            uid = (await store.adapter.read('__uuid__')) || '0'
        }
        uid = (parseInt(uid, 10) + 1).toString()
        return uid
    }

    function get() {
        return uid
    }

    return {
        next,
        get,
    }
}

// only for `{}`
export function isEmptyObject(x) {
    return x && typeof x === 'object' && Object.getOwnPropertyNames(x).length === 0
}
