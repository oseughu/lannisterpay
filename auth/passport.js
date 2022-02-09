const passport = require('passport')
const passportJwt = require('passport-jwt')
const { User } = require('../models')
const ExtractJwt = passportJwt.ExtractJwt
const StrategyJwt = passportJwt.Strategy

passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({ where: { id: jwtPayload.id } })
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)
