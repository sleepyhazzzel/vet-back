import { Router } from 'express'
import { register, userLogin, userLogout, extend, getProfile, getAccount } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'

const router = Router()
router.post('/', register)
router.post('/login', auth.login, userLogin)
router.delete('/logout', auth.jwt, userLogout)
router.patch('/extend', auth.jwt, extend)
router.get('/me', auth.jwt, getProfile)
router.get('/search', getAccount)

export default router
