# 从属关系

## one to one

一夫一妻制

```yaml
{
    relationship: 'hasOne',
    modelname: 'B',
}

{
    relationship: 'belongsTo',
    modelname: 'A'
}

A_id_1: {
    b: 1,
}

A_id_2: {
    b: 2,
}

store: {
    'a_with_b': {
        1: [1],
        2: [2],
    }
}
```

## one to many

后宫制

```yaml
{
    relationship: 'hasMany',
    modelname: 'B',
}

{
    relationship: 'belongsTo',
    modelname: 'A'
}

A_id_1: {
    b: [1, 2],
}

A_id_2: {
    b: [3, 4]
}

store: {
    a_with_b: {
        1: [1],
        2: [1],
        3: [2],
    }
}
```

## many to many

```yaml
{
    relationship: 'hasMany',
    modelname: 'B',
}

{
    relationship: 'belongsTo',
    modelname: 'A'
}

A_id_1: {
    b: [1, 2],
}

A_id_2: {
    b: [1, 3]
}

store: {
    // 用于反向查找，一组含有 b 的 a
    a_with_b: {
        // b.id: Array<a.id>
        1: [1, 2],
        2: [1],
        3: [2],
    }
}

```

# Master 变更

- 更新 master.servant：
  增加了，那么就要去 master_with_servant 里建立一个关联
  删除了，那么就要去 master_with_servant 里取消一个关联
- 删除 master
  去 master_with_servant 取消所有关联

# Servant 变更
- 删除 servant
  根据反向索引，取消所有关联
