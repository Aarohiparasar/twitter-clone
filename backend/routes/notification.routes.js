import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { getNotification } from '../controllers/notification.controllers.js'
import { deleteNotification } from '../controllers/notification.controllers.js'
const router=express.Router()

router.get("/",protectRoute,getNotification)
router.delete("/",protectRoute,deleteNotification)
export default router