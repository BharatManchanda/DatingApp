import mongoose from "mongoose";
import User, { IUser } from '../model/user';
import { AuthenticatedRequest } from '../middleware/auth';
const { body } = require('express-validator');

export const sendRequestValidator = [
	body("receiverId")
		.notEmpty()
		.withMessage("Receiver ID is required")
		.custom(async (receiverId:string, { req }: { req: AuthenticatedRequest }) => {

			if (!mongoose.Types.ObjectId.isValid(receiverId)) {
				return Promise.reject("Invalid Receiver ID format.");
			}

			// 1. Check if receiver user exists
			const receiver = await User.findById(receiverId);

			if (!receiver) {
				return Promise.reject("Receiver user does not exist.");
			}

			// 2. Prevent self-request
			const { _id } = req.user as IUser;
			if (_id.toString() === receiverId.toString()) {
				return Promise.reject("You cannot send a friend request to yourself.");
			}


			// 3. Check if already friends
			if (receiver.friends?.includes(_id)) {
				return Promise.reject("You are already friends with this user.");
			}

			// 5. Check if request already sent
			if (receiver.receivedRequests?.includes(_id)) {
				return Promise.reject("You have already sent a friend request to this user.");
			}

			// 6. Check if request already received from this user (they sent to you)
			if (receiver.sentRequests?.includes(_id)) {
				return Promise.reject("This user has already sent you a friend request.");
			}

			return true;
		}),
];

export const acceptRequestValidator = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required")
    .bail()
    .custom(async (receiverId: string, { req }: { req: AuthenticatedRequest }) => {

		if (!mongoose.Types.ObjectId.isValid(receiverId)) {
			return Promise.reject("Invalid Receiver ID format.");
		}

		const receiverUser = await User.findById(receiverId);
		if (!receiverUser) {
			return Promise.reject("Receiver user does not exist.");
		}

		const currentUser = await User.findById(req.user._id);
		if (!currentUser) {
			return Promise.reject("Current user not found.");
		}

		const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

		const hasRequest = currentUser.receivedRequests?.includes(receiverObjectId);
		
		if (!hasRequest) {
			return Promise.reject("No friend request from this user.");
		}

		return true;
    }),
];

export const cancelRequestValidator = [
	body("receiverId")
		.notEmpty()
		.withMessage("Receiver ID is required")
		.custom(async (receiverId: string, { req }: { req: AuthenticatedRequest }) => {
			if (!mongoose.Types.ObjectId.isValid(receiverId)) {
				throw new Error("Invalid receiver ID format");
			}

			const currentUser = await User.findById(req.user._id);
			if (!currentUser) {
				return Promise.reject("Current user not found.");
			}

			const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

			const hasRequest = currentUser.sentRequests?.includes(receiverObjectId);
			if (!hasRequest) {
				return Promise.reject("No friend request for this user.");
			}

			return true;
		}),
];


