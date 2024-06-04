import mongoose, { Document, Schema } from "mongoose";

export interface IHobby extends Document {
  name: string;
  active: boolean;
}

const hobbySchema: Schema = new Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const Hobby = mongoose.model<IHobby>("Hobby", hobbySchema);

export default Hobby;
