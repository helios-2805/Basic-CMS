import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary
      required: [true, 'Video File is required!!']
    },
    thumbNail: {
      type: String, // cloudinary
      required: [true, 'Thumbnail for the video is required!!']
    },
    title: {
      type: String,
      required: [true, 'Title is required!!']
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // cloudinary
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timeseries: true
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);