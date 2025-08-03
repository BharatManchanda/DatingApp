import { Request, Response } from 'express';
import { UserUtil } from '../utils/UserUtil';
import { AuthenticatedRequest } from '../middleware/auth';

class AuthController {
    constructor() {
        
    }

    static async signup (req:Request, res:Response) {
        try {
            const response = await UserUtil.save(req.body);
            res.json({
                status: false,
                message: "User register successfully.",
                data: {
                    user: response.user,
                    token: response.token,
                },
            });
        } catch (error:any) {
            res.status(422).json({
                status: false,
                message: error.message || "Something went wrong.",
            });
        }
    }

    static async signin (req:Request, res:Response) {
        try {
            const response = await UserUtil.login(req.body);
            res.json({
                status: false,
                message: "User sign in successfully.",
                data: {
                    user: response.user,
                    token: response.token,
                },
            });
        } catch (error:any) {
            res.status(422).json({
                status: false,
                message: error.message || "Something went wrong.",
            });
        }
    }

    static async updateProfile (req:Request, res:Response) {
        try {
            const userReq = req as AuthenticatedRequest; 
            const response = await UserUtil.updateProfile(userReq.body, userReq.user);
            res.json({
                status: false,
                message: "User profile updated successfully.",
                data: {
                    user: response,
                },
            });
        } catch (error:any) {
            res.status(422).json({
                status: false,
                message: error.message || "Something went wrong.",
            });
        }
    }

    static async getMe(req:Request, res:Response) {
        try {
            const userReq = req as AuthenticatedRequest; 
            let response = null;
            if (userReq.user) {
                response = await UserUtil.getMe(userReq.user);
            } else {
                throw new Error("User not found."); 
            }
            res.json({
                status: false,
                message: "User detail fetched successfully.",
                data: {
                    user: response,
                },
            });
        } catch (error:any) {
            res.status(422).json({
                status: false,
                message: error.message || "Something went wrong.",
            });
        }
    }
}
export default AuthController