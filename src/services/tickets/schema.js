import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TicketSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "customer" },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    dueDate: { type: Date },
    subject: { type: String, required: true },
    detailInfo: { type: String, required: true },
    file: { type: Buffer },
  },
  { timestamps: true }
);

export default model("ticket", TicketSchema);
