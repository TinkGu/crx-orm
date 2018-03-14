import orm from '../src'
import Tag from './models/Tag'
import Repo from './models/Repo'

function createStore(initial) {
    const adapter = orm.createMemoryAdapter()
    Object.assign(adapter.snapshot(), initial)
    return orm.createStore({
        adapter,
        schemas: [
            Tag,
            Repo
        ],
    })
}

it('many to many', () => {
    const store = createStore()
    expect(store.relationsManager.snapshot()).toEqual({
        tag: {
            hasMany: {},
            hasOne: {},
            belongsTo: { repo: true },
        },
        repo: {
            hasMany: { tag: true },
            hasOne: {},
            belongsTo: {},
        }
    })
})

it('query', () => {
    const store = createStore()
    const { query } = store.relationsManager
    expect(query('tag', 'belongsTo', 'repo')).toBe(true)
    expect(query('repo', 'hasMany', 'tag')).toBe(true)
    expect(query('repo', 'hasOne', 'tag')).toBe(false)
    expect(query('repo', 'belongsTo', 'tag')).toBe(false)
    expect(query('repo1', 'hasMany', 'tag')).toBe(false)
    expect(query('tag', 'hasMany', 'repo')).toBe(false)
    expect(query('tag', 'hasOne', 'repo')).toBe(false)
})
