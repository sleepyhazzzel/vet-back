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

export const updateStatus = async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail(new Error('NOT FOUND'))
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

export const getAllDayAppointments = async (req, res) => {
  try {
    const { date, doctor } = req.query
    // console.log(doctor)
    const appointments = await Appointment.find({ date, doctor })
    // console.log(appointments)
    const total = [0, 0, 0]
    appointments.forEach(appointment => {
      if (appointment.time === '上午診') {
        total[0]++
      } else if (appointment.time === '下午診') {
        total[1]++
      } else if (appointment.time === '夜間診') {
        total[2]++
      }
    })
    // console.log(total)
    // 超過不給預約
    const result = total.map(time => {
      return time > 1
    })
    // console.log(result)
    res.status(StatusCodes.OK).json({
      success: true,
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

export const getStatus = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA')
    const hour = new Date().getHours()
    let range = ''
    if (hour <= 12) {
      range = '上午診'
    } else if (hour <= 17) {
      range = '下午診'
    } else {
      range = '夜間診'
    }
    const maxOrder = await Appointment.aggregate([
      // 只选择今天日期且status为true的预约
      {
        $match: {
          date: today,
          time: range,
          status: true
        }
      },
      // 对每个医生的预约进行分组，并找到每组中的最大order
      {
        $group: {
          _id: '$doctor',
          maxOrder: { $max: '$order' }
        }
      }
    ])

    const doctors = await Admin.aggregate([
      {
        $match: {
          position: '獸醫師'
        }
      },
      {
        $project: {
          _id: '$_id',
          doctor_name: '$account'
        }
      }
    ])
    // console.log('maxOrder', maxOrder)
    // console.log('doctor', doctors)

    const result = doctors.map(doctor => {
      return {
        doctor_id: doctor._id,
        doctor_name: doctor.doctor_name,
        date: today,
        time: range
      }
    })
    // console.log('result', result)

    // 如果沒資料跑迴圈放 status = 0
    if (maxOrder.length === 0) {
      for (let i = 0; i < 2; i++) {
        result[i].status = 0
      }
    } else if (maxOrder.length === 1) {
      maxOrder.forEach(item => {
        result.forEach(doctor => {
          if (item._id.toString() === doctor.doctor_id.toString()) {
            doctor.status = item.maxOrder
          } else {
            doctor.status = 0
          }
        })
      })
    } else {
      maxOrder.forEach(item => {
        result.forEach(doctor => {
          if (item._id.toString() === doctor.doctor_id.toString()) {
            doctor.status = item.maxOrder
          }
        })
      })
    }
    // console.log('new result', result)
    res.status(StatusCodes.OK).json({
      success: true,
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
