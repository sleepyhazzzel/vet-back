import { Router } from 'express'
import { addAppointment, getAppointments, getAppointOrder, deleteAppointment, getPetAppointments, updateStatus, getAllDayAppointments, getStatus } from '../controllers/appointments.js'

const router = Router()

router.post('/', addAppointment)
router.get('/', getAppointments)
router.get('/clinic', getStatus)
router.get('/day', getAllDayAppointments)
router.get('/order', getAppointOrder)
router.get('/:id', getPetAppointments)
router.patch('/:id', updateStatus)
router.delete('/:id', deleteAppointment)

export default router
