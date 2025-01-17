import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    requestType: {
      type: String,
      enum: ["Admin","Delete Comment"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);


const Request = mongoose.models.requests || mongoose.model("requests", requestSchema);

export default Request;
