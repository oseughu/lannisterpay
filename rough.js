const currencyCountry = 'us'

const locale = () => (currencyCountry === 'NG' ? 'LOCL' : 'INTL')
// const property =
//   paymentMethod.brand === '' ? paymentMethod.issuer : paymentMethod.brand

console.log(locale())
