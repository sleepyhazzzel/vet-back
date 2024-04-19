## Veterinary Hospital Registration System - BackEnd (動物醫院掛號系統 - 後端)
- Veterinary NoSQL database built with ***MongoDB***
- Linking front and back end routes with ***Express***
- Using ***JSON Web Token (JWT)*** for Login Function
- Image files uploaded to the free space ***Cloudinary***
- [FrontEnd Click Here ~ (前端點這)](https://github.com/sleepyhazzzel/vet-front)

---
### 🗂️ Database ERD
![](https://github.com/sleepyhazzzel/vet-back/blob/main/images/nosql_database.png)

---
### 👉 Controllers Examples
- Get the maximum order number of the current reservation (取得目前最大掛號號碼)
```javascript
export const getAppointOrder = async (req, res) => {
  try {
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}
```
- Get current appointment number(取得目前看診進度)
```javascript
export const getStatus = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA')
    const hour = new Date().getHours()
    let range = ''
    if (hour <= 12) { range = '上午診' } else if (hour <= 17) { range = '下午診' } else { range = '夜間診' }

    const maxOrder = await Appointment.aggregate([
      { $match: { date: today, time: range, status: true }}, // 只選擇今天日期且已看診的預約(status = true)
      { $group: { _id: '$doctor', maxOrder: { $max: '$order' }}} // 對不同醫生的預約進行分組，並找到已看診的最大掛號號碼
    ])
    const doctors = await Admin.aggregate([
      { $match: { position: '獸醫師' }},
      { $project: { _id: '$_id', doctor_name: '$account' }}
    ])
    const result = doctors.map(doctor => {
      return {
        doctor_id: doctor._id,
        doctor_name: doctor.doctor_name,
        date: today,
        time: range
      }
    })

    if (maxOrder.length === 0) { // 醫生都沒有預約資料
      for (let i = 0; i < 2; i++) {
        result[i].status = 0
      }
    } else if (maxOrder.length === 1) { // 其中一個醫生有預約資料
      maxOrder.forEach(item => {
        result.forEach(doctor => {
          if (item._id.toString() === doctor.doctor_id.toString()) { doctor.status = item.maxOrder } else { doctor.status = 0 }
        })
      })
    } else { // 醫生們都有預約資料
      maxOrder.forEach(item => {
        result.forEach(doctor => {
          if (item._id.toString() === doctor.doctor_id.toString()) { doctor.status = item.maxOrder }
        })
      })
    }
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
```
