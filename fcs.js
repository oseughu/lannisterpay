export const fcs = [
  {
    fee_id: 'LNPY1221',
    fee_locale: 'LOCL',
    fee_currency: 'NGN',
    fee_entity: 'CREDIT_CARD',
    entity_property: '*',
    fee_type: 'perc',
    fee_flat: 0,
    fee_value: 1.4
  },
  {
    fee_id: 'LNPY1222',
    fee_locale: 'INTL',
    fee_currency: 'NGN',
    fee_entity: 'CREDIT-CARD',
    entity_property: 'MASTERCARD',
    fee_type: 'perc',
    fee_flat: 0,
    fee_value: 3.8
  },
  {
    fee_id: 'LNPY1223',
    fee_locale: 'LOCL',
    fee_currency: 'NGN',
    fee_entity: 'USSD',
    fee_type: 'flat_perc',
    fee_flat: 20,
    fee_value: 0.5
  }
]

const feeConfig = feeItem.fee_config
const appliedFee = feeItem.perc
  ? perc(feeItem.applied_fee)
  : flatPerc(feeItem.flat, feeItem.applied_fee)
