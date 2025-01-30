import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  sheet: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Data = mongoose.model('Data', dataSchema);

export default Data;