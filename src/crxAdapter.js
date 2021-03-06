export default function createCrxAdapter(options = {}) {
    const { storageArea = 'local' } = options
    /**
     * @param {String|Array|Object} field Object key to get object from storage
     * @return {Promise}
     */
    function read(field) {
        return new Promise(resolve => {
            chrome.storage[storageArea].get(field, response => {
                if (typeof field === 'string') {
                    resolve(response[field])
                } else {
                    resolve(response)
                }
            })
        })
    }

    /**
     * get the whole raw data
     * @return {Promise}
     */
    function snapshot() {
        return read(null)
    }

    /**
     * Save access token to extension sync storage
     * @param {Object} content
     * @return {Promise}
     */
    function set(content) {
        return new Promise(resolve => {
            chrome.storage[storageArea].set(
                content,
                () => resolve()
            )
        })
    }

    /**
     * @param {String|Array|Object} field Object key to delete
     * @return {Promise}
     */
    function remove(fields) {
        return new Promise(resolve => {
            chrome.storage[storageArea].remove(fields, response => {
                resolve(response)
            })
        })
    }

    return {
        read,
        snapshot,
        set,
        remove,
    }
}
