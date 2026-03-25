import { Router } from 'express'
import { create, join, list, detail, remove, leave } from '../controllers/groupController'
import { groupRanking } from '../controllers/rankingController'

const router = Router()
router.get('/', list)
router.post('/', create)
router.post('/join', join)
router.get('/:id', detail)
router.get('/:id/ranking', groupRanking)
router.delete('/:id/members/me', leave)
router.delete('/:id/members/:userId', remove)
export default router
