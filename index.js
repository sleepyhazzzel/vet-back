import 'dotenv/config.js'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routeUsers from './routes/users.js'
import routeAdmins from './routes/admins.js'
import routePets from './routes/pets.js'
import routeAppointments from './routes/appointments.js'
import { StatusCodes } from 'http-status-codes'
import './passport/passport.js'

const app = express()

app.use(cors({
  // origin = 請求的來源
  // callback(錯誤, 是否允許)
  origin (origin, callback) {
    if (origin === undefined || origin.includes('github.io') || origin.includes('localhost')) {
      callback(null, true)
    } else {
      callback(new Error('CORS'), false)
    }
  }
}))
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: '請求被拒絕'
  })
})

app.use(express.json())
app.use((_, req, res, next) => {
  // 底線( _ ) => 錯誤
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: '資料格式錯誤'
  })
})

app.use('/users', routeUsers)
app.use('/admins', routeAdmins)
app.use('/pets', routePets)
app.use('/appointments', routeAppointments)

app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  console.log('資料庫連線成功')
})
