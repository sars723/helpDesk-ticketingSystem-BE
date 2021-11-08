import mongoose from "mongoose";

const { Schema, model } = mongoose;

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
    dueDate: { type: Date },
    subject: { type: String, required: true },
    detailInfo: { type: String, required: true },
    assignedTo: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      enum: ["new", "closed"],
      default: "new",
    },
    file: { type: String },
    messageHistory: [
      {
        message: { type: String, required: true },
        attachments: [String],
        sender: {
          type: String,
          required: true,
        },
        msgAt: {
          type: Date,
          required: true,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

export default model("ticket", TicketSchema);
