import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    requestType: {
      type: String,
      enum: ["Admin", "Category"],
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
    // New Field
    requestedFor: {
      type: String,
      validate: {
        validator: function (value) {
          // Ensure `requestedFor` is provided only for `Category` requestType
          if (this.requestType === "Category" && !value) {
            return false; // Invalid if `requestedFor` is missing for `Category`
          }
          return true;
        },
        message: "The 'requestedFor' field is required when 'requestType' is 'Category'.",
      },
    },
  },
  { timestamps: true }
);

const Request = mongoose.models.requests || mongoose.model("requests", requestSchema);

export default Request;
