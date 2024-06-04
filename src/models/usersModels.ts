import mongoose, { Document, Schema } from "mongoose";
import Hobby from "./hobbyModels";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  hobby_ids: mongoose.Types.ObjectId[] | null;
}

const userSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  hobby_ids: [{ type: mongoose.Types.ObjectId, ref: Hobby, default: null }],
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
