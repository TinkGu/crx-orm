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
