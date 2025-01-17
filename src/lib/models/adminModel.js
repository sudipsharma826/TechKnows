// adminModel.js (ensure this is the correct file)
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, default: "admin" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

module.exports = {
  Admin,
  adminSchema,  // Explicitly export the schema
};
