import mongoose from "mongoose";
import User, { IUser } from '../model/user';
import { AuthenticatedRequest } from '../middleware/auth';
const { body } = require('express-validator');

export const sendRequestValidator = [
	body("receiverId")
		.notEmpty()
		.withMessage("Receiver ID is required")
		.custom(async (receiverId:string, { req }: { req: AuthenticatedRequest }) => {
			// Cast to your custom request type to access `req.user`
			// const typedReq = req as AuthenticatedRequest;

			if (!mongoose.Types.ObjectId.isValid(receiverId)) {
				return Promise.reject("Invalid Receiver ID format.");
			}

			// 1. Check if receiver user exists
			const user = await User.findById(receiverId);

			if (!user) {
				return Promise.reject("Receiver user does not exist.");
			}

			// 2. Prevent self-request
			const { _id } = req.user as IUser;
			if (_id.toString() === receiverId.toString()) {
			return Promise.reject("You cannot send a friend request to yourself.");
			}


			// 3. Check for existing friend request in either direction
			const existingRequest = await User.findOne({
				$or: [
					{ senderId: req.user._id, receiverId },
					{ senderId: receiverId, receiverId: req.user._id },
				],
			});

			if (existingRequest) {
				return Promise.reject("Friend request already exists.");
			}

			return true;
		}),
];
