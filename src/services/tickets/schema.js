import mongoose from "mongoose";

const { Schema, model } = mongoose;

/* const MessageSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    content: { type: String, required: true },
    attachments: [String],
    sender: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  },
  { timestamps: true }
); */

const TicketSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "General Sales",
        "Payment Issue",
        "Hardware Issue",
        "Software Issue",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Normal", "High", "Critical"],
    },
    dueDate: { type: Date, default: "" },
    subject: { type: String, required: true },
    detailInfo: { type: String, required: true },
    assignedTo: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      enum: ["assigned", "new", "closed"],
      default: "new",
    },
    file: { type: String },
    messageHistory: [
      {
        message: { type: String, required: true },
        attachments: [String],
        sender: {
          type: String /* Schema.Types.ObjectId,
          ref: "Customer" */,
          required: true,
        },
        msgAt: {
          type: Date,
          required: true,
          default: Date.now(),
        },
      },
    ],
    /*  messageHistory: [MessageSchema], */
    /*  messageHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "message",
        required: true,
      },
    ], */
  },
  { timestamps: true }
);

export default model("ticket", TicketSchema);
