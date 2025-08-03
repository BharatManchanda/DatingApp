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
                    friendRequests: userReq.user._id
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
            const userReq = req as AuthenticatedRequest; 

            const receiverId = userReq.user._id;
            const { senderId } = userReq.body;

            const receiver = await User.findById(receiverId);
            const sender = await User.findById(senderId);

            if (!receiver || !sender) {
                return res.status(404).json({ message: "User not found." });
            }

            if (!receiver.friendRequests.includes(sender._id)) {
                return res.status(400).json({ message: "No friend request found." });
            }

            receiver.friendRequests = receiver.friendRequests.filter(id => !id.equals(sender._id));
            sender.sentRequests = sender.sentRequests.filter(id => !id.equals(receiver._id));

            receiver.friends.push(sender._id);
            sender.friends.push(receiver._id);

            await receiver.save();
            await sender.save();

            return res.status(200).json({ message: "Friend request accepted." });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // async cancelRequest(req: Request, res: Response) {
    //     try {
    //         const currentUserId = req.user._id;
    //         const { otherUserId } = req.body;

    //         const currentUser = await User.findById(currentUserId);
    //         const otherUser = await User.findById(otherUserId);

    //         if (!currentUser || !otherUser) {
    //             return res.status(404).json({ message: "User not found." });
    //         }

    //         currentUser.sentRequests = currentUser.sentRequests.filter(id => !id.equals(otherUser._id));
    //         currentUser.friendRequests = currentUser.friendRequests.filter(id => !id.equals(otherUser._id));
    //         otherUser.sentRequests = otherUser.sentRequests.filter(id => !id.equals(currentUser._id));
    //         otherUser.friendRequests = otherUser.friendRequests.filter(id => !id.equals(currentUser._id));

    //         await currentUser.save();
    //         await otherUser.save();

    //         return res.status(200).json({ message: "Friend request cancelled or rejected." });
    //     } catch (error: any) {
    //         return res.status(500).json({ message: error.message });
    //     }
    // }

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
