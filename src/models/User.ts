import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "manager"],
    default: "manager",
  },
  name: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;

export async function ensureDefaultUser() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create({
      email: "alaminice1617@gmail.com",
      password: "425379",
      role: "owner",
      name: "Owner",
    });
    console.log("Default owner user created");
  }
}
