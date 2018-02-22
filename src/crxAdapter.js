export default function createCrxAdapter() {
    /**
     * @param {String|Array|Object} field Object key to get object from storage
     * @return {Promise}
     */
    function read(field) {
        return new Promise(resolve => {
            chrome.storage.sync.get(field, response => {
                resolve(response)
            })
        })
    }

    /**
     * Save access token to extension sync storage
     * @param {Object} content
     * @return {Promise}
     */
    function set(content) {
        return new Promise(resolve => {
            chrome.storage.sync.set(
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
            chrome.storage.sync.remove(fields, response => {
                resolve(response)
            })
        })
    }

    return {
        read,
        set,
        remove,
    }
}
