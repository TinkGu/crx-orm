export default function createRelationsManager() {
    const _relationships = {}

    function link(relationship, master, servant) {
        if (!_relationships[master]) {
            init(master)
        }

        if (!_relationships[servant]) {
            init(servant)
        }

        _relationships[master][relationship][servant] = true
        _relationships[servant].belongsTo[master] = true
    }

    function resolve(model = {}) {
        const { name, properties = {} } = model
        Object.values(properties).forEach(p => {
            if (p.type === 'relationship') {
                link(p.relationship, name, p.modelname)
            }
        })
    }

    function init(modelname) {
        if (typeof modelname === 'string' && modelname !== '') {
            _relationships[modelname] = {
                hasOne: {},
                hasMany: {},
                belongsTo: {},
            }
        }
    }

    function query(a, relationship, b) {
        return !!(_relationships[a]
            && _relationships[a][relationship]
            && _relationships[a][relationship][b])
    }

    function snapshot() {
        return _relationships
    }

    return {
        link,
        resolve,
        query,
        snapshot,
    }
}
