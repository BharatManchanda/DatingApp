import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../model/user";
import dotenv from "dotenv";

dotenv.config();

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

const auth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ status: false, message: "Authorization token is missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).json({ status: false, message: "User not found." });
    }

    const tokenExists = user.tokens.some((t: { token: string }) => t.token === token);

    if (!tokenExists) {
      return res.status(401).json({ status: false, message: "Token doesn't exist." });
    }

    (req as AuthenticatedRequest).user = user;

    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    next();
  } catch (error: any) {
    return res.status(404).json({ status: false, message: error.message || "Authentication failed" });
  }
};

export default auth;
