import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import multer from "multer";

// Use memory storage (good for uploading to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

import { getUserProfile,followUnfollowUser,getSuggestedUsers,updateUserProfile} from '../controllers/user.controllers.js'

const router=express.Router()

router.get("/profile/:username",protectRoute,getUserProfile)
router.get("/suggested",protectRoute,getSuggestedUsers)
router.post("/follow/:id",protectRoute,followUnfollowUser)
// Accept single profileImg and coverImg
router.post(
  "/update",
  protectRoute,
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  updateUserProfile
);

export default router