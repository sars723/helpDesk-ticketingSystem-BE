import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    /*   ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    }, */
    message: { type: String, required: true },
    attachments: [String],
    sender: {
      type: String /* Schema.Types.ObjectId, ref: "Customer" */,
      required: true,
    },
    msgAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    /* recipient: { type: Schema.Types.ObjectId, ref: "Customer", required: true }, */
  },
  { timestamps: true }
);

export default model("message", MessageSchema);
