import { Router } from 'express'
import { addPet } from '../controllers/pets.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', upload, addPet)

export default router
