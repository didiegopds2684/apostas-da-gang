import { Router } from 'express'
import { savePrediction, myPredictions } from '../controllers/predictionController'

const router = Router()
router.post('/', savePrediction)
router.get('/me', myPredictions)
export default router
