const higherRelationshipGenerator = (relationship) => (modelname) => ({
    type: 'relationship',
    relationship,
    modelname,
})

export const hasMany = higherRelationshipGenerator('hasMany')
export const hasOne = higherRelationshipGenerator('hasOne')
