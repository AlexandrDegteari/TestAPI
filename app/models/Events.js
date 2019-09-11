import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    require: true
  },
  tags: {
    type: Array,
    require: true
  },
  date: {
    type: Number,
    require: true
  },
  images: {
    type: String,
    required: true
  },
  created: {
    type: Number,
    required: true
  },
	amount: {
		type: Number,
		required: true
	},
  updated: {
    type: Number,
    required: true
  },
  location: {
    label: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  }
});

export default mongoose.model("Event", EventSchema);
