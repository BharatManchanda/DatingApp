import FriendController from "../controllers/FriendController"
import express from "express"
import { sendRequestValidator } from "../validation/friendValidator";
import { Validate } from "../middleware/validate";

const router = express.Router();

router.post("/send-request", sendRequestValidator, Validate, FriendController.sendRequest)
// router.post("/accept-request", FriendController.acceptRequest)
// router.post("/cancel-request", FriendController.cancelRequest)
// router.post("/remove-friend", FriendController.removeFriend)
// router.post("/get-friends", FriendController.getFriends)

export default router;