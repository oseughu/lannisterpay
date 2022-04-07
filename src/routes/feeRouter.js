import express from 'express'
import { Fee } from '#models/fee'

export const feeRouter = express.Router()

feeRouter.post('/fees', async (req, res) => {
  const { FeeConfigurationSpec } = req.body

  let feeId,
    feeLocale,
    feeCurrency,
    feeEntity,
    entityProperty,
    feeType,
    feeFlat,
    feePerc,
    feeValue

  try {
    const fees = FeeConfigurationSpec.split('\n')

    fees.forEach(fee => {
      let config = fee.split(' ')
      let entity = config[3].split('(')
      let value = config[7].split(':')
      feeId = config[0]
      feeCurrency = config[1]
      feeLocale = config[2]
      feeEntity = entity[0]
      entityProperty = entity[1].slice(0, -1)
      feeType = config[6]
      feeFlat =
        feeType === 'FLAT'
          ? config[7]
          : feeType === 'FLAT_PERC'
          ? +parseFloat(value[0]).toFixed(2)
          : 0
      feePerc =
        feeType === 'PERC'
          ? config[7]
          : feeType === 'FLAT_PERC'
          ? +parseFloat(value[1]).toFixed(2)
          : 0
      feeValue =
        feeType === 'FLAT_PERC'
          ? `${feeFlat}:${feePerc}`
          : feeType === 'FLAT'
          ? feeFlat
          : feePerc

      Fee.create({
        FeeId: feeId,
        FeeLocale: feeLocale,
        FeeCurrency: feeCurrency,
        FeeEntity: feeEntity,
        EntityProperty: entityProperty,
        FeeType: feeType,
        FeeFlat: feeFlat,
        FeePerc: feePerc,
        FeeValue: feeValue
      })
    })
    res.json({ status: 'ok', message: 'Fee Configs successfully added.' })
  } catch (error) {
    res.status(500).json({ error: 'Fee Configs could not be added.' })
  }
})
