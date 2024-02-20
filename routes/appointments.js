import { Router } from 'express'
import { addAppointment, getAppointments, getAppointOrder, deleteAppointment } from '../controllers/appointments.js'

const router = Router()

router.post('/', addAppointment)
router.get('/', getAppointments)
router.get('/order', getAppointOrder)
router.delete('/:id', deleteAppointment)

export default router
