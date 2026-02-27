import mongoose from "mongoose";

const OEMRequestSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    specifications: String,
    quantity: Number,
    budgetMin: Number,
    budgetMax: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ["open", "negotiating", "confirmed", "cancelled"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.OEMRequest ||
  mongoose.model("OEMRequest", OEMRequestSchema);