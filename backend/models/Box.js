import { Schema, model } from "mongoose";

// Define the schema for the items
const itemSchema = new Schema({
  mediaType: {
    type: String,
  },
  description: {
    type: String,
    required: false, // Optional field
  },
  mediaPath: {
    type: String,
  },
}, { timestamps: true });

// Define the schema for the box
const boxSchema = new Schema({
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
    required: true
  },
  privateCode: {
    type: Number,
    required: false,
  },
  items: [itemSchema],
}, { timestamps: true });


// Export the model
export default model("Box", boxSchema);
