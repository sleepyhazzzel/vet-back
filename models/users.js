import { Schema, model, ObjectId, Error } from 'mongoose'
import taiwanIdValidator from 'taiwan-id-validator'
import validator from 'validator'
import bcrypt from 'bcrypt'

const schema = new Schema({
  email: {
    type: String,
    required: [true, '缺少使用者信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '信箱格式錯誤'
    }
  },
  password: {
    type: String,
    required: [true, '缺少使用者密碼']
  },
  user_name: {
    type: String
  },
  honorific: {
    type: String
  },
  national_id: {
    type: String,
    required: [true, '缺少使用者身分證字號'],
    unique: true,
    validate: {
      validator (value) {
        return taiwanIdValidator.isNationalIdentificationNumberValid(value)
      },
      message: '身分證格式錯誤'
    }
  },
  phone: {
    type: String,
    minlength: [10, '手機號碼長度不符'],
    validate: {
      validator (value) {
        return validator.isMobilePhone(value, 'zh-TW')
      },
      message: '手機格式錯誤'
    }
  },
  address: {
    type: String
  },
  pets: {
    type: [ObjectId],
    ref: 'pets'
  },
  tokens: {
    type: [String]
  }
}, {
  versionKey: false
})

// 密碼驗證
schema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    if (user.password.length < 6 || user.password.length > 20) {
      // 太長太短時，回傳錯誤訊息
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度不符' }))
      next(error)
      return
    } else {
      // 密碼格式正確後，加鹽加密
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
