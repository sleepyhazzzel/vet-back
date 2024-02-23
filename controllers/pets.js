import Pet from '../models/pets.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'
// import { Types } from 'mongoose'

export const addPet = async (req, res) => {
  try {
    req.body.image = req.file.path
    const result = await Pet.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getAll = async (req, res) => {
  try {
    const result = await Pet.find({}, '_id chip_id image name species breed gender')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const getPet = async (req, res) => {
  try {
    const result = await Pet.findById(req.params.id)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const editPet = async (req, res) => {
  try {
    console.log(req.body)
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    await Pet.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無資料'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const deletePet = async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true
    })
  } catch (error) {
    if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無資料'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getDescription = async (req, res) => {
  try {
    const result = await Pet.findById(req.params.id, 'descriptions').lean()
    result.descriptions.map((item) => {
      item.date = item.date.toLocaleDateString('zh-TW')
      return item
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const addDescription = async (req, res) => {
  try {
    const result = await Pet.findByIdAndUpdate(req.params.id, { $push: { descriptions: req.body } }, { new: true })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const editDescription = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    await Pet.findOneAndUpdate(
      { _id: req.params.id, 'descriptions._id': req.params.did },
      { $set: { 'descriptions.$': req.body } },
      { new: true }
    ).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無資料'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const deleteDescription = async (req, res) => {
  try {
    await Pet.findByIdAndUpdate(req.params.id, { $pull: { descriptions: { _id: req.params.did } } }, { new: true })
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const getPets = async (req, res) => {
  try {
    const result = await Pet.find({ owner: req.params.id }, '_id name species breed gender weight birth chip_id image')
    // const result = pets.map((item) => {
    //   item.birth = item.birth.toLocaleDateString('zh-TW')
    //   return item
    // })
    console.log(result)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
