import { Schema, model, ObjectId } from 'mongoose'

const schema = new Schema({
  date: {
    type: String,
    required: [true, '缺少預約日期']
  },
  time: {
    type: String,
    required: [true, '缺少預約時段']
  },
  owner: {
    type: ObjectId,
    ref: 'users',
    required: [true, '缺少飼主ID']
  },
  pet: {
    type: ObjectId,
    ref: 'pets',
    required: [true, '缺少寵物ID']
  }
})

export default model('appointments', schema)
