// const passport = require('passport')
// const passportJwt = require('passport-jwt')
// const { Customer } = require('../models')
// const ExtractJwt = passportJwt.ExtractJwt
// const StrategyJwt = passportJwt.Strategy

// passport.use(
//   new StrategyJwt(
//     {
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.SECRET //hide secret in .env file
//     },
//     async (jwtPayload, done) => {
//       try {
//         const customer = await Customer.findOne({
//           where: { id: jwtPayload.id }
//         })
//         return done(null, customer)
//       } catch (err) {
//         return done(err)
//       }
//     }
//   )
// )
