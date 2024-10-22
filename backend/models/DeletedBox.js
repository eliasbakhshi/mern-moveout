import { Schema, model } from "mongoose";

// Define the schema for the items
const itemSchema = new Schema(
  {
    mediaType: {
      type: String,
    },
    description: {
      type: String,
    },
    value: {
      type: Number,
    },
    mediaPath: {
      type: String,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Define the schema for the box
const deletedBoxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    labelNum: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      required: true,
    },
    privateCode: {
      type: Number,
    },
    items: [itemSchema],
    type: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Export the model
export default model("DeletedBox", deletedBoxSchema);
