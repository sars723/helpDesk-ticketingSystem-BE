import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default: "https://bit.ly/3lBk8d3",
    },
    password: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["user", "support-team", "admin", "employee"],
      default: "user",
    },
    department: {
      type: String,
      enum: ["marketing", "IT", "support", "sales", "administration", "none"],
      default: "none",
    },
    /* refreshToken: { type: String }, */
    /*  googleId: { type: String }, */
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });
  /*  console.log("user", user); */
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    /* console.log("is match", isMatch); */
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

export default mongoose.model("user", UserSchema);
