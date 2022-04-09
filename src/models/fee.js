import mongoose from 'mongoose'
const { Schema, model } = mongoose

const feeSchema = new Schema({
  FeeId: String,
  FeeLocale: String,
  FeeCurrency: String,
  FeeEntity: String,
  EntityProperty: String,
  FeeType: String,
  FeeFlat: Number,
  FeePerc: Number,
  FeeValue: String
})

export const Fee = new model('Fee', feeSchema)
