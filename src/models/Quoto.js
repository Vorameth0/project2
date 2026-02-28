import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema(
  {
    oemRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "OEMRequest", required: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    price: { type: Number, required: true },
    note: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

QuoteSchema.index({ oemRequestId: 1, createdAt: -1 });

export default mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);