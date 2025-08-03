import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IToken {
	token: string;
	issueAt: Date;
}

export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	birth_date: Date;
    phone: string;
    email: string;
	role: string;
    password: string;
	tokens: IToken[];
	friends: mongoose.Types.ObjectId[];
	friendRequests: mongoose.Types.ObjectId[];
	sentRequests: mongoose.Types.ObjectId[];
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const TokenSchema = new Schema<IToken>({
	token: { type: String, required: true },
	issueAt: { type: Date, required: true },
});

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true},
		birth_date: { type: Date, required: true},
		phone: { type: String, required: true },
		email: { type: String, required: true },
		role: { type: String, default: 'client' },
		password: { type: String, required: true },
		tokens: [TokenSchema],
		friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		sentRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		status: { type: String, default: '' },
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

UserSchema.set('toObject', { virtuals: true });

UserSchema.set("toJSON", {
	virtuals: true,
    transform: function (doc, ret:Partial<IUser & { _id: unknown; __v: number }>, options) {
        delete ret.password;
        delete ret.tokens;
        return ret;
    },
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
