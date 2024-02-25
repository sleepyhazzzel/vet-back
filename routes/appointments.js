import { Router } from 'express'
import { addAppointment, getAppointments, getAppointOrder, deleteAppointment, getPetAppointments } from '../controllers/appointments.js'

const router = Router()

router.post('/', addAppointment)
router.get('/', getAppointments)
router.get('/order', getAppointOrder)
router.delete('/:id', deleteAppointment)
router.get('/:id', getPetAppointments)

export default router
