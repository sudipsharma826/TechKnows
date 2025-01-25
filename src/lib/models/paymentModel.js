import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order_id: { type: String, default: null },
    epayment_id: { type: String, default: null },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Khalti"] },
    status: { 
      type: String, 
      required: true, 
       
      default: "Pending" 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
