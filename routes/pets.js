import { Router } from 'express'
import { addPet, getAll, getPet, editPet, deletePet, getDescription, addDescription, editDescription, deleteDescription, getPets } from '../controllers/pets.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', upload, addPet)
router.get('/', getAll)
router.get('/:id', getPet)
router.patch('/:id', editPet)
router.delete('/:id', deletePet)
router.get('/medical/:id', getDescription)
router.post('/medical/:id', addDescription)
router.patch('/medical/:id/:did', editDescription)
router.delete('/medical/:id/:did', deleteDescription)
router.get('/owner/:id', getPets)

export default router
