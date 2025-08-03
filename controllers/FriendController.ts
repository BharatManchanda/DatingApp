import { Request, Response } from 'express';
import User from '../model/user'; // Update path to your user model
import { AuthenticatedRequest } from '../middleware/auth';

class FriendController {
    async sendRequest(req: Request, res: Response) {
        try {
            const userReq = req as AuthenticatedRequest
            await User.findByIdAndUpdate(userReq.user._id, {
                $addToSet: {
                    sentRequests: userReq.body.receiverId
                }
            });

            await User.findByIdAndUpdate(req.body.receiverId, {
                $addToSet: {
                    receivedRequests: userReq.user._id
                }
            });
            res.json({
                status: true,
                message: 'Request sent.'
            });
        } catch (err:any) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    }

    async acceptRequest(req: Request, res: Response) {
        try {
            res.json({
                status: true,
                message: "Something wrong",
            });
            const userReq = req as AuthenticatedRequest;
            await User.findByIdAndUpdate(userReq.user._id, {
                $addToSet: {
                    friends: userReq.body.receiverId
                },
                $pull: {
                    receivedRequests: userReq.body.receiverId // Remove from receivedRequests
                }
            });

            await User.findByIdAndUpdate(userReq.body.receiverId, {
                $addToSet: {
                    friends: userReq.user._id
                },
                $pull: {
                    sentRequests: userReq.user._id // Remove from sentRequests
                }
            });

            let data = await User.findById(userReq.body.receiverId);

            res.json({
                status: true,
                message: 'Friend request accepted.',
                data: data,
            });
        } catch (err:any) {
            res.status(422).json({
                status: false,
                message: err.message
            });
        }
    }

    async cancelRequest(req: Request, res:Response) {
        try {
            // Remove the sent request from the sender
            const userReq = req as AuthenticatedRequest;
            await User.findByIdAndUpdate(userReq.user._id, {
                $pull: {
                    sentRequests: userReq.body.receiverId
                }
            });

            // Remove the friend request from the receiver
            await User.findByIdAndUpdate(userReq.body.receiverId, {
                $pull: {
                    receivedRequests: userReq.user._id
                }
            });

            let data = await User.findById(userReq.body.receiverId);

            res.json({
                status: true,
                message: 'Friend request cancelled.',
                data: data,
            });
        } catch (err:any) {
            res.status(400).json({
                status: false,
                message: err.message
            });
        }
    }

    // async removeFriend(req: Request, res: Response) {
    //     try {
    //         const currentUserId = req.user._id;
    //         const { friendId } = req.body;

    //         const currentUser = await User.findById(currentUserId);
    //         const friend = await User.findById(friendId);

    //         if (!currentUser || !friend) {
    //             return res.status(404).json({ message: "User not found." });
    //         }

    //         currentUser.friends = currentUser.friends.filter(id => !id.equals(friend._id));
    //         friend.friends = friend.friends.filter(id => !id.equals(currentUser._id));

    //         await currentUser.save();
    //         await friend.save();

    //         return res.status(200).json({ message: "Friend removed." });
    //     } catch (error: any) {
    //         return res.status(500).json({ message: error.message });
    //     }
    // }

    // async getFriends(req: Request, res: Response) {
    //     try {
    //         const userId = req.user._id;
    //         const user = await User.findById(userId).populate('friends', 'name email');

    //         if (!user) {
    //             return res.status(404).json({ message: "User not found." });
    //         }

    //         return res.status(200).json({ friends: user.friends });
    //     } catch (error: any) {
    //         return res.status(500).json({ message: error.message });
    //     }
    // }
}

export default new FriendController();
