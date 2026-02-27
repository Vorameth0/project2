import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    oemRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "OEMRequest", required: true, index: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

MessageSchema.index({ oemRequestId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
