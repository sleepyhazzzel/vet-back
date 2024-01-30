import { Schema, model, ObjectId } from 'mongoose'
import Gender from '../enums/Gender'

const schema = new Schema({
  chip_id: {
    type: Number,
    required: [true, '缺少寵物晶片'],
    unique: true
  },
  name: {
    type: String
  },
  spice: {
    type: String
  },
  gender: {
    type: Number,
    default: Gender.FEMALE
  },
  description: {
    type: String
  },
  owner: {
    type: ObjectId,
    ref: 'users'
  }
})

export default model('pets', schema)
