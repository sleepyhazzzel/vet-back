import Appointment from '../models/appointments.js'
import Pet from '../models/pets.js'
import Admin from '../models/admins.js'
import { StatusCodes } from 'http-status-codes'

export const addAppointment = async (req, res) => {
  try {
    const { date, time, doctor, owner, pet } = req.query
    const { order } = req.body
    const isAppointed = await Appointment.findOne({ date, time, doctor, owner, pet })
    if (isAppointed) throw new Error('已預約')

    await Appointment.create({ date, time, doctor, owner, pet, order })
    res.status(StatusCodes.OK).json({
      success: true
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
    } else if (error.message === '已預約') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '不可重複預約'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getAppointments = async (req, res) => {
  try {
    const { date, time, doctor } = req.query
    const appointments = await Appointment.find({ date, time, doctor })

    const result = await Promise.all(appointments.map(async appointment => {
      const pet = await Pet.findById(appointment.pet, 'name species breed personality')
      return {
        ...appointment._doc,
        pet_name: pet.name,
        pet_species: pet.species,
        pet_breed: pet.breed,
        pet_personality: pet.personality
      }
    }))

    res.status(StatusCodes.OK).json({
      success: true,
      result
    })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getAppointOrder = async (req, res) => {
  try {
    // req.query is an object containing a property for each query string parameter in the route. If there is no query string, it is the empty object, {}.
    const { date, time, doctor } = req.query
    const appointment = await Appointment
      .find({ date, time, doctor })
      .sort({ order: -1 }) // Sort in descending order
      .limit(1) // Limit to 1 document
    const maxOrder = appointment.length > 0 ? appointment[0].order : 0
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      maxOrder
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
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

export const getPetAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ pet: req.params.id })
    const result = await Promise.all(appointments.map(async appointment => {
      const doctor = await Admin.findById(appointment.doctor, 'account')
      return {
        ...appointment._doc,
        doctor_name: doctor.account
      }
    }))
    res.status(StatusCodes.OK).json({
      success: true,
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}
