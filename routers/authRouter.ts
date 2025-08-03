import AuthController from "../controllers/AuthController"
import express from "express"
import auth from "../middleware/auth";

const router = express.Router();

router.post("/signup", AuthController.signup)
router.post("/signin", AuthController.signin)

router.use(auth);

router.post("/update-profile", AuthController.updateProfile)
router.post("/get-me", AuthController.getMe)

export default router;