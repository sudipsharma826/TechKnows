import mongoose from 'mongoose';
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  expiryTime: { type: Number, required: true },
  description: { type: String, required: true },
  subscribedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true
});

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);
export default Package;