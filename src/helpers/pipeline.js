export const pipeline = [
  {
    $match: {
      $or: [
        { FeeEntity: type },
        { EntityProperty: { $in: [number, sixId, brand, issuer] } },
        { FeeLocale: { $in: [locale] } }
      ]
    }
  },
  {
    $project: {
      FeeId: 1,
      FeeType: 1,
      FeeFlat: 1,
      FeePerc: 1,
      _id: 0,
      criteria: {
        $switch: {
          branches: [
            {
              case: { $eq: ['$FeeEntity', type] },
              then: type
            },
            {
              case: { $eq: ['$EntityProperty', issuer] },
              then: issuer
            },
            {
              case: { $eq: ['$EntityProperty', brand] },
              then: brand
            },
            {
              case: { $eq: ['$EntityProperty', sixId] },
              then: sixId
            },
            {
              case: { $eq: ['$EntityProperty', number] },
              then: number
            },
            {
              case: { $eq: ['$FeeLocale', locale] },
              then: locale
            }
          ],
          default: '*'
        }
      }
    }
  },
  { $sort: { criteria: -1 } }
]
