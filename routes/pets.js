import { Router } from 'express'
import { addPet, getAll, getPetProfile, updatePet, deletePet, getDescription, addDescription, editDescription, deleteDescription } from '../controllers/pets.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', upload, addPet)
router.get('/', getAll)
router.get('/:id', getPetProfile)
router.patch('/:id', updatePet)
router.delete('/:id', deletePet)
router.get('/medical/:id', getDescription)
router.post('/medical/:id', addDescription)
router.patch('/medical/:id', editDescription)
router.delete('/medical/:id/:did', deleteDescription)

export default router
