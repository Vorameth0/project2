import mongoose from "mongoose";

const QuotationSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "OEMRequest" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: Number,
    timelineDays: Number,
    notes: String,
    status: {
      type: String,
      enum: ["submitted", "accepted", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", QuotationSchema);