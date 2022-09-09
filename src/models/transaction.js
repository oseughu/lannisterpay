import mongoose from 'mongoose'
const { Schema, model } = mongoose

const transactionSchema = new Schema({
  ID: Number,
  Amount: Number,
  Currency: String,
  CurrencyCountry: String,
  Customer: {
    ID: Number,
    EmailAddress: String,
    FullName: String,
    BearsFee: Boolean
  },
  PaymentEntity: {
    ID: Number,
    Issuer: String,
    Brand: String,
    Number: String,
    SixID: Number,
    Type: String,
    Country: String
  }
})

const Transaction = new model('Transaction', transactionSchema)

export default Transaction
