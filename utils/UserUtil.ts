import User, { IUser } from "../model/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface IUserInput {
    name: string;
    birth_date: Date;
    phone: string;
    email: string;
    password: string;
}

interface ILoginInput {
    email: string;
    password: string;
}

export class UserUtil {
    static async save(data: IUserInput): Promise<{ user: IUser; token: string }> {
        const { name, birth_date, phone, email, password } = data;

        let user = await User.findOne({ email });

        if (user) {
            // Update existing user fields
            user.name = name,
            user.birth_date = birth_date;
            user.phone = phone;
            user.password = password; // You might want to hash this if not already
        } else {
            // Create new user if not found
            user = new User({
                name,
                birth_date,
                phone,
                email,
                password
            });
        }

        const savedUser = await user.save();

        const token = jwt.sign(
            { _id: savedUser._id, email: savedUser.email },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "60d" }
        );

        savedUser.tokens.push({ token, issueAt: new Date() });
        await savedUser.save();

        return {user:savedUser, token};
    }

    static async login(data: ILoginInput): Promise<{user:IUser, token: string}> {
        const { email, password } = data;

        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid credentials.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials.");

        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "60d" }
        );

        user.tokens.push({ token, issueAt: new Date() });
        const savedUser = await user.save();

        return {user: savedUser, token};
    }

    static async logout(token: string): Promise<IUser> {
        if (!token) {
            throw new Error("Token not provided.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { _id: string };

        const user = await User.findOne({ _id: decoded._id });
        if (!user) throw new Error("User not found.");

        user.tokens = user.tokens.filter(t => t.token !== token);
        const savedUser = await user.save();

        return savedUser;
    }

    static async getMe(user: IUser): Promise<IUser> {
        const foundUser = await User.findById(user._id).select("-password -tokens");
        if (!foundUser) throw new Error("User not found.");
        return foundUser;
    }

    static async updateProfile(data: Partial<IUser>, user:IUser) {
        const { name, birth_date } = data;

        let updatedUser = await User.findByIdAndUpdate(user._id, {
            name,
            birth_date,
        }, {
            new: true,
            runValidators: true,
        });

        return updatedUser
    }
}
