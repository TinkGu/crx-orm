import orm from '../src'
import TagModel from './models/Tag'

function createStore(initial) {
    const adapter = orm.createMemoryAdapter()
    Object.assign(adapter.snapshot(), initial)
    return orm.createStore({
        adapter,
        schemas: [
            TagModel,
        ],
    })
}

describe('read model', () => {
    const tag = {
        id: 'xxx',
        name: 'tag-xxx',
    }

    const store = createStore({
        'tag:id:xxx': tag,
        tagIds: [tag.id],
        'tag:name:tag-xxx': 'xxx',
    })
    const tagModel = store.models.tag

    it('should read tag by id', async () => {
        expect(await tagModel.find(tag.id)).toBe(tag)
    })

    it('should read tag by doc name', async () => {
        expect(await tagModel.find({
            name: tag.name
        })).toBe(tag)
    })
})

describe('create model', () => {
    const store = createStore()
    const tagModel = store.models.tag

    it('should create model、id in ids、indexes', async () => {
        expect.assertions(3)

        const tag = await tagModel.create({ name: 'china' })
        const tagInRead = await tagModel.find(tag.id)
        const ids = await tagModel.readIds()
        const nameIndex = await tagModel.readRaw('name', tag.name)

        expect(tagInRead).toBe(tag)
        expect(ids.includes(tag.id)).toBe(true)
        expect(nameIndex).toBe(tag.id)
    })
})


describe('update model', () => {
    const store = createStore()
    const tagModel = store.models.tag

    it('should update model and indexes', async () => {
        expect.assertions(3)

        const tagBefore = await tagModel.create({ name: 'china' })
        const tagAfter = await tagModel.update(tagBefore, x => ({
            ...x,
            name: 'zh',
            desc: 'chinese shorthand',
        }))
        const nameIndexBefore = await tagModel.readRaw('name', tagBefore.name)
        const nameIndexAfter = await tagModel.readRaw('name', tagAfter.name)

        expect(tagAfter).toEqual({
            id: tagBefore.id,
            name: 'zh',
            desc: 'chinese shorthand',
        })

        expect(nameIndexBefore).toBe(null)
        expect(nameIndexAfter).toBe(tagBefore.id)
    })
})

describe('remove model', () => {
    const store = createStore()
    const tagModel = store.models.tag

    it('should remove model、id in ids、indexes', async () => {
        expect.assertions(3)

        const tag = await tagModel.create({ name: 'china' })
        await tagModel.remove(tag.id)
        const tagAfterRemove = await tagModel.find(tag.id)
        const nameIndex = await tagModel.readRaw('name', tag.name)
        const ids = await tagModel.readIds()

        expect(tagAfterRemove).toBe(null)
        expect(ids.includes(tag.id)).toBe(false)
        expect(nameIndex).toBe(null)
    })
})
