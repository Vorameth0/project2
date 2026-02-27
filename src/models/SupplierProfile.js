import mongoose from "mongoose";

const SupplierProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    categories: [String],
    minimumOrderQuantity: Number,
    capacityPerMonth: Number,
    leadTimeDays: Number,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.SupplierProfile ||
  mongoose.model("SupplierProfile", SupplierProfileSchema);