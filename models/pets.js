import { Schema, model, ObjectId } from 'mongoose'
import Gender from '../enums/Gender'
import Personality from '../enums/Personality'

const ownerSchema = new Schema({
  owner_id: {
    type: ObjectId,
    ref: 'users'
  },
  name: {
    type: String
  },
  phone: {
    type: String
  }
})

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
  chip_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String
  },
  species: {
    type: String
  },
  gender: {
    type: Number,
    default: Gender.FEMALE
  },
  weight: {
    type: Number
  },
  birth: {
    type: Date
  },
  personality: {
    type: Number,
    default: Personality.GENTLE
  },
  descriptions: {
    type: [descriptionSchema]
  },
  owner: {
    type: ownerSchema
  }
}, {
  versionKey: false
})

export default model('pets', schema)
