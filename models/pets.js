import { Schema, model, ObjectId } from 'mongoose'

const descriptionSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  }
})

const schema = new Schema({
  name: {
    type: String
  },
  species: {
    type: String
  },
  breed: {
    type: String
  },
  gender: {
    type: String
  },
  weight: {
    type: Number
  },
  birth: {
    type: String
  },
  personality: {
    type: String
  },
  chip_id: {
    type: String,
    unique: true
  },
  descriptions: {
    type: [descriptionSchema]
  },
  owner: {
    type: ObjectId,
    ref: 'users'
  },
  image: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('pets', schema)
