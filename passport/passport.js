import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'
import admins from '../models/admins.js'

passport.use('login', new passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await users.findOne({ email })
    if (!user) {
      throw new Error('EMAIL')
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('PASSWORD')
    }
    return done(null, user, null)
  } catch (error) {
    console.log(error)
    if (error.message === 'EMAIL') {
      return done(null, null, { message: '帳號不存在' })
    } else if (error.message === 'PASSWORD') {
      return done(null, null, { message: '密碼錯誤' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))

passport.use('adminLogin', new passportLocal.Strategy({
  usernameField: 'account',
  passwordField: 'password'
}, async (account, password, done) => {
  try {
    const admin = await admins.findOne({ account })
    if (!admin) {
      throw new Error('ACCOUNT')
    }
    if (!bcrypt.compareSync(password, admin.password)) {
      throw new Error('PASSWORD')
    }
    return done(null, admin, null)
  } catch (error) {
    console.log(error)
    if (error.message === 'ACCOUNT') {
      return done(null, null, { message: '帳號不存在' })
    } else if (error.message === 'PASSWORD') {
      return done(null, null, { message: '密碼錯誤' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))

passport.use('jwt', new passportJWT.Strategy({
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
  // 略過過期檢查
  ignoreExpiration: true
}, async (req, payload, done) => {
  // req => 請求物件
  // payload => 解譯的資料
  try {
    // .exp => 可以用 JWT 把 token 解碼
    // payload = { iat: 時麼時候有的, exp: 什麼時候過期 }
    // iat, exp 單位是秒，node.js 日期單位是毫秒
    // 檢查是否過期
    const expired = payload.exp * 1000 < new Date().getTime()

    /*
      http://localhost:4000/users/test?aaa=111&bbb=222
      req.originalUrl = /users/test?aaa=111&bbb=222
      req.baseUrl = /users
      req.path = /test
      req.query = { aaa: 111, bbb: 222 }
    */

    const url = req.baseUrl + req.path
    if (expired && url !== '/users/extend' && url !== '/users/logout') {
      throw new Error('EXPIRED')
    }

    // const token = req.headers.authorization.split(' ')
    const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    const user = await users.findOne({ _id: payload._id, tokens: token })
    if (!user) {
      throw new Error('JWT')
    }

    return done(null, { user, token }, null)
    //
  } catch (error) {
    if (error.message === 'EXPIRED') {
      return done(null, null, { message: 'JWT過期' })
    } else if (error.message === 'JWT') {
      return done(null, null, { message: 'JWT無效' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))

passport.use('adminjwt', new passportJWT.Strategy({
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
  ignoreExpiration: true
}, async (req, payload, done) => {
  try {
    const expired = payload.exp * 1000 < new Date().getTime()

    const url = req.baseUrl + req.path
    if (expired && url !== '/admins/extend' && url !== '/admins/logout') {
      throw new Error('EXPIRED')
    }

    const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    const admin = await admins.findOne({ _id: payload._id, tokens: token })
    if (!admin) {
      throw new Error('JWT')
    }

    return done(null, { admin, token }, null)
    //
  } catch (error) {
    console.log(error)
    if (error.message === 'EXPIRED') {
      return done(null, null, { message: 'JWT過期' })
    } else if (error.message === 'JWT') {
      return done(null, null, { message: 'JWT無效' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))
