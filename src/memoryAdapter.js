// TODO：校验入参，报错

export default function createMemoryAdapter() {
    // eslint-disable-next-line prefer-const
    let __store = {}

    function getFieldList(field) {
        if (typeof field === 'string') {
            return [field]
        }

        if (typeof field === 'object') {
            return Object.keys(field)
        }

        if (Array.isArray(field)) {
            return field
        }

        return []
    }

    /**
     * @param {String|Array|Object} field Object key to get object from storage
     * @return {Promise}
     */
    function read(field) {
        const finalFields = getFieldList(field)
        return new Promise(resolve => {
            let result = null
            if (typeof field === 'string') {
                result = __store[finalFields[0]]
            } else {
                if (finalFields.length > 0) {
                    result = {}
                    finalFields.forEach(x => {
                        result[x] = __store[x]
                    })
                }
            }

            resolve(result)
        })
    }

    /**
     * Save access token to obj
     * @param {Object} content
     * @return {Promise}
     */
    function set(content) {
        return new Promise(resolve => {
            if (typeof content === 'object') {
                Object.assign(__store, content)
            }
            resolve()
        })
    }

    /**
     * @param {String|Array|Object} field Object key to delete
     * @return {Promise}
     */
    function remove(field) {
        const finalFields = getFieldList(field)
        return new Promise(resolve => {
            finalFields.forEach(x => {
                delete __store[x]
            })
            resolve()
        })
    }

    function snapshot() {
        return __store
    }

    return {
        read,
        set,
        remove,
        snapshot,
    }
}
