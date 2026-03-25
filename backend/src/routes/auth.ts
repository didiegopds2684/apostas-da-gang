import { Router } from 'express'
import { verifyToken } from '../controllers/authController'

const router = Router()
router.post('/verify', verifyToken)
export default router
