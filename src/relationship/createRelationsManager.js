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

    function resolve(schema = {}) {
        const { name, properties = {} } = schema
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

    function query(relationship, master, servant) {
        return _relationships[master][relationship][servant]
    }

    return {
        link,
        resolve,
        query,
    }
}
