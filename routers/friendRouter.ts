import FriendController from "../controllers/FriendController"
import express from "express"
import { acceptRequestValidator, cancelRequestValidator, sendRequestValidator } from "../validation/friendValidator";
import { Validate } from "../middleware/validate";

const router = express.Router();

router.post("/send-request", sendRequestValidator, Validate, FriendController.sendRequest)
router.post("/accept-request", acceptRequestValidator, Validate, FriendController.acceptRequest)
router.post("/cancel-request", cancelRequestValidator, Validate, FriendController.cancelRequest)
// router.post("/remove-friend", FriendController.removeFriend)
// router.post("/get-friends", FriendController.getFriends)

export default router;