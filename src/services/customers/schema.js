import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["user", "support-team", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", async function (next) {
  const newCustomer = this;
  const plainPW = newCustomer.password;
  if (newCustomer.isModified("password")) {
    newCustomer.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

CustomerSchema.methods.toJSON = function () {
  const customerDocument = this;
  const customerObject = customerDocument.toObject();
  delete customerObject.password;
  delete customerObject.__v;
  return customerObject;
};

CustomerSchema.statics.checkCredentials = async function (email, plainPW) {
  const customer = await this.findOne({ email });
  /* console.log(customer); */
  if (customer) {
    const isMatch = await bcrypt.compare(plainPW, customer.password);
    /*  console.log("is match", isMatch); */
    if (isMatch) return customer;
    else return null;
  } else {
    return null;
  }
};

export default mongoose.model("customer", CustomerSchema);
