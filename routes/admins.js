import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { addAdmin, getAll, adminLogin, adminLogout, extend, getProfile, updateAdmin } from '../controllers/admin.js'

const router = Router()
router.post('/', addAdmin)
router.get('/', getAll)
// router.post( router, middleware(驗證), controller(執行) )
router.post('/login', auth.adminLogin, adminLogin)
router.delete('/logout', auth.adminjwt, adminLogout)
router.patch('/extend', auth.adminjwt, extend)
router.get('/me', auth.adminjwt, getProfile)
router.patch('/:id', auth.adminjwt, updateAdmin)

export default router
